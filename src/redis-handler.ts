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
    client.lPush("record", JSON.stringify(message));
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
    redisPush
}