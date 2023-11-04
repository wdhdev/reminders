import { Client, Collection, Snowflake } from "discord.js";
import { embeds, main } from "../config";
import * as Sentry from "@sentry/node";

export default class ExtendedClient extends Client {
    public commandIds: Collection<string, Snowflake>;
    public commands: Collection<string, any>;
    public config_embeds: typeof embeds;
    public config_main: typeof main;
    public events: Collection<string, any>;
    public logCommandError: Function;
    public logError: Function;
    public reminders: Map<string, NodeJS.Timeout>;
    public sentry: typeof Sentry;
    public validPermissions: string[];
}
