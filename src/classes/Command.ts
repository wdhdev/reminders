import { PermissionResolvable } from "discord.js";

export default class Command {
    public name: string;
    public description: string;
    public aliases: string[];
    public botPermissions: PermissionResolvable[];
    public cooldown: number;
    public enabled: boolean;
    public execute: Function;
}
