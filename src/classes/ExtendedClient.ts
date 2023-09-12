import { Client, Collection } from "discord.js";
import { embeds, main } from "../config";
import * as Sentry from "@sentry/node";
import Reminder from "../interfaces/Reminder";

export default class ExtendedClient extends Client {
    public commands: Collection<string, any>;
    public config_embeds: typeof embeds;
    public config_main: typeof main;
    public events: Collection<string, any>;
    public logCommandError: Function;
    public logError: Function;
    public reminders: Reminder[];
    public sentry: typeof Sentry;
    public validPermissions: string[];
}
