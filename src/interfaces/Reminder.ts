import { Snowflake } from "discord.js";

export default interface Reminder {
    id: string;
    user: Snowflake;
    set: number;
    timestamp: number;
    reason: string;
    handler?: NodeJS.Timeout;
}
