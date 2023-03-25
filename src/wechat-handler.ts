import {Contact, Message} from "wechaty";
import {RoomInterface} from "wechaty/src/user-modules/room";
import {MessageEvent, messageType} from "./message-event";

/**
 * If it is a reply message, you need to split the two messages.
 * label is the name of the sender of the quoted message, 
 * content is the content of the quoted text,
 * rest is the content of the reply
 */
async function splitText (text: string): Promise<[string, string]> {
    const regex = /^「(.+?)：(.+?)」(.*)$/;
    const match = text.match(regex);
    if (match) {
        const [, label, content, rest] = match;
        return [rest.trim(), `${label}：${content}`];
    }
    return [text, ""]; 
}

/**
 * Get text and quote separately
 */
async function getText (text: string, label: number): Promise<string> {
    const [msg, pmsg] = await splitText(text);
    return 1 == label ? msg : pmsg;
}

async function message2MessageEvent (msg: Message): Promise<MessageEvent> {
    const room = msg.room();
    return {
        id: msg.id,
        timestamp: msg.date().getTime(),
        message: await getText(msg.text(), 1),
        parentMessage: await getText(msg.text(), 2),
        messageType: await messageType(msg.type()),
        userId: msg.talker().id,
        userName: room ? (await room.alias(msg.talker()) || msg.talker().name()) : msg.talker().name(),
        chatId: room ? room.id : `P2P-${msg.talker().id}`,
        chatType: room ? "group" : "p2p"
    };
}

async function says (room: RoomInterface, contact: Contact, message: string) {
    if (room) {
        await room.say(message);
    } else {
        await contact.say(message);
    }
}

async function reply (message: Message) {
    const contact: Contact = message.talker();
    const content: string = message.text();
    const room: any = message.room();

    if (content.startsWith('/ping')) {
        await says(room, contact, `pong`);
        return;
    }
}

export {
    MessageEvent,
    reply,
    message2MessageEvent
}