import { Client, Collection, Snowflake } from "discord.js";
import config from "../../config.json";

export default class ExtendedClient extends Client {
    public commandIds: Collection<string, Snowflake>;
    public commands: Collection<string, any>;
    public config: typeof config;
    public events: Collection<string, any>;
    public logCommandError: Function;
    public logError: Function;
    public reminders: Map<string, NodeJS.Timeout>;
    public validPermissions: string[];
}
