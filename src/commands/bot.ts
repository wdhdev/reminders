import Command from "../classes/Command";
import ExtendedClient from "../classes/ExtendedClient";
import { Message } from "discord.js";

const bot = require("../../package.json");

const command: Command = {
    name: "bot",
    description: "Different information about the bot.",
    aliases: [],
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    async execute(message: Message, args: string[], cmd: Command, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            const info = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: client.user.tag.endsWith("#0") ? client.user.username : client.user.tag, iconURL: client.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${client.user.id}` })
                .setDescription(bot.description)
                .addFields (
                    { name: "📈 Version", value: bot.version, inline: true },
                    { name: "🟢 Online Since", value: `<t:${(Date.now() - client.uptime).toString().slice(0, -3)}:f>`, inline: true },
                    { name: "📊 Statistics", value: `Guilds: \`${client.guilds.cache.size}\`\nUsers: \`${client.users.cache.size}\`` }
                )

            message.reply({ embeds: [info] });
        } catch(err) {
            client.logCommandError(err, message, Discord);
        }
    }
}

export = command;
