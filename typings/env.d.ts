import { Snowflake } from "discord.js";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            clientId: Snowflake;
            sentry_dsn: string;
            token: string;
        }
    }
}

export {};
