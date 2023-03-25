// @ts-ignore
import QRCode from "qrcode";
import {Contact, Message, ScanStatus, WechatyBuilder} from "wechaty";
import {RedisClientClass, redisPush, isVisited} from "./redis-handler";
import {reply, message2MessageEvent} from "./wechat-handler";

/**
 * Message event core handler, 
 * plus the need to avoid messages being triggered repeatedly
 * @param message message body
 */
async function handler(message: Message) {
    if (await isVisited(redisClient, message.id)) {
        await reply(message);
        await redisPush(redisClient, await message2MessageEvent(message));
    }
}

/**
 * Scan code to login
 */
async function onScan(qrcode: string, status: ScanStatus) {
    const qrcodeImageUrl = [
      'https://api.qrserver.com/v1/create-qr-code/?data=',
      encodeURIComponent(qrcode),
    ].join('');
    console.log(`Scan QR Code to login: ${status}\n${qrcodeImageUrl}`);
    console.log(
        await QRCode.toString(qrcode, { type: "terminal", small: true })
    );
}

/**
 * Log in wechat
 */
async function onLogin(user: Contact) {
    console.log(`Hello, ${user.name()}`);
}

/**
 * Log out wechat
 */
async function onLogout(user: Contact) {
    console.log(`Goodbye, ${user.name()}`);
}

/**
 * Group chat messages will be listened to, 
 * single chat messages will not.
 */
async function onMessage(message: Message) {
    if ( message.self() || !message.room() ) {
        return;
    }
    await handler(message);
}

// init wechaty properties
const bot = WechatyBuilder.build({
    name: "wechat-unickcheng-bot",
    puppet: 'wechaty-puppet-wechat',
    puppetOptions: {
        uos: true 
    }
});

// init redis client
const redisClient = RedisClientClass.build();
redisClient.connect();

// start execution
bot
    .on('scan', onScan)
    .on('login', onLogin)
    .on('logout', onLogout)
    .on('message', onMessage);

bot
    .start()
    .then(() => console.log('Starting Login ...'))
    .catch((e) => console.error(e));