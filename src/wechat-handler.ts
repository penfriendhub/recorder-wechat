import {Contact, Message} from "wechaty";
import {RoomInterface} from "wechaty/src/user-modules/room";
import {MessageEvent} from "./message-event";

async function message2MessageEvent (msg: Message): Promise<MessageEvent> {
    return {
        id: msg.id,
        timestamp: msg.date().getTime(),
        message: msg.text(),
        userId: msg.talker().id,
        userName: msg.talker().name()
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