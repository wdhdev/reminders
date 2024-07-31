import { Client, Collection, Snowflake } from "discord.js";
import config from "../config";
import * as Sentry from "@sentry/node";

export default class ExtendedClient extends Client {
    public commandIds: Collection<string, Snowflake>;
    public commands: Collection<string, any>;
    public config: typeof config;
    public events: Collection<string, any>;
    public logCommandError: Function;
    public logError: Function;
    public maxReminderTime: number;
    public reminders: Map<string, NodeJS.Timeout>;
    public sentry: typeof Sentry;
    public timeToSet: number;
    public validPermissions: string[];
}
