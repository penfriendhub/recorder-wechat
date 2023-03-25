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

async function redisPush (client: RedisClientType, message: MessageEvent) {
    client.lPush(`recorder-${message.chatId}`, JSON.stringify(message));
}

async function validate (client: RedisClientType, key: string) {
    try {
        const value = await client.get(key);
        return value ? false : true;
    } catch (error) { 
        await client.set(key, "1");
        await client.expire(key, 60*60);
        return true;
    }
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
    validate
}