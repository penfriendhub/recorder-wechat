import {Contact, Message} from "wechaty";
import {RoomInterface} from "wechaty/src/user-modules/room";
import {MessageEvent, messageType} from "./message-event";

async function message2MessageEvent (msg: Message): Promise<MessageEvent> {
    const room = msg.room();
    return {
        id: msg.id,
        timestamp: msg.date().getTime(),
        message: msg.text(),
        messageType: await messageType(msg.type()),
        userId: msg.talker().id,
        userName: room ? (await room.alias(msg.talker()) || msg.talker().name()) : msg.talker().name(),
        chatId: room ? room.id : "P2P"
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