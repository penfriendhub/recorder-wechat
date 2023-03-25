import { RedisClientType, createClient } from "redis";
import { MessageEvent } from "./message-event";
import dotenv from "dotenv";
dotenv.config();

interface RedisConfig {
    host: string;
    port: string;
    db?: string;
    password?: string;
}

function getRedisUrl({ host, port, db }: RedisConfig): string {
    const url = `redis://${host}:${port}`;
    return db ? `${url}/${db}` : url;
}

function initRedisClient(): RedisClientType {
    const config: RedisConfig = {
        host: process.env.REDIS_HOST ?? '127.0.0.1',
        port: process.env.REDIS_PORT ?? '6379',
        db: process.env.REDIS_DB ?? undefined,
        password: process.env.REDIS_PASS ?? undefined,
    };
    return createClient({
        url: getRedisUrl(config),
        password: config.password,
    });
}

/**
 * Record message events separately by group
 */
async function redisPush (client: RedisClientType, message: MessageEvent) {
    client.lPush(`recorder-${message.chatId}`, JSON.stringify(message));
}

/**
 * Avoid repeat triggering of unread and outdated messages 
 */
async function validate (client: RedisClientType, key: string, timestamp: number) {
    return await isOutdated(timestamp) && isVisited(client, key);
}

/**
 * Avoid repeat triggering of outdated messages.
 * Set to a fixed value of 1 hour currently 
 */
async function isOutdated (timestamp: number): Promise<boolean> {
    const timeDiffInMs = Date.now() - timestamp;
    const timeDiffInHours = timeDiffInMs / (1000 * 60 * 60);
    return timeDiffInHours > 1 ? true : false;
}

/**
 * Avoid repeat triggering of unread messages.
 * Set to a fixed value of 1 hour currently 
 */
async function isVisited (client: RedisClientType, key: string): Promise<boolean> {
    const value = await client.get(key);
    await client.set(key, "1");
    await client.expire(key, 60*60);
    return "1" == value ? false : true;
}

class RedisClientClass {
    private static client: RedisClientType;

    static build(): RedisClientType {
        this.client = initRedisClient();
        this.client.on("error", (err) => {
            console.error("Redis error: ", err);
        });
        return this.client;
    }
}

export {
    RedisClientClass,
    redisPush,
    validate,
    isVisited,
    isOutdated
}