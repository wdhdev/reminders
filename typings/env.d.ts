import { Snowflake } from "discord.js";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            CLIENT_ID: Snowflake;
            MONGO_URI: string;
            SENTRY_DSN: string;
            TOKEN: string;
            EXPRESS_ENABLED: boolean;
            EXPRESS_PORT: number;
        }
    }
}

export {};
