import { Snowflake } from "discord.js";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            clientId: Snowflake;
            database: string;
            sentry_dsn: string;
            token: string;
        }
    }
}

export {};
