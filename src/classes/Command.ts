import { ApplicationCommandOptionData, PermissionResolvable, Permissions } from "discord.js";

export default class Command {
    public name: string;
    public description: string;
    public options: ApplicationCommandOptionData[];
    public default_member_permissions: Permissions | null;
    public botPermissions: PermissionResolvable[];
    public cooldown: number;
    public enabled: boolean;
    public deferReply: boolean;
    public ephemeral: boolean;
    public execute: Function;
    public autocomplete?: Function;
}
