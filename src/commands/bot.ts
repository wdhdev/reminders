import Command from "../classes/Command";
import ExtendedClient from "../classes/ExtendedClient";
import { Message } from "discord.js";

const bot = require("../../package.json");

import Reminder from "../models/Reminder";

const command: Command = {
    name: "bot",
    description: "Different information about the bot.",
    aliases: [],
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    async execute(message: Message, args: string[], cmd: Command, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            const reminders = await Reminder.find();

            const info = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: client.user.tag.endsWith("#0") ? client.user.username : client.user.tag, iconURL: client.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${client.user.id}` })
                .setDescription(bot.description)
                .addFields (
                    { name: "📈 Version", value: bot.version, inline: true },
                    { name: "🟢 Online Since", value: `<t:${(Date.now() - client.uptime).toString().slice(0, -3)}:f>`, inline: true },
                    { name: "🔔 Active Reminders", value: `${reminders.length}` },
                    { name: "📊 Guild Count", value: `${client.guilds.cache.size}` }
                )
    
            const buttons: any = new Discord.ActionRowBuilder()
                .addComponents (
                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setEmoji("🔗")
                        .setLabel("Invite")
                        .setURL(`https://wdh.gg/reminders`),

                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setEmoji("🗳️")
                        .setLabel("Vote")
                        .setURL(`https://wdh.gg/reminders-vote`),

                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setEmoji("🐙")
                        .setLabel("GitHub")
                        .setURL(`https://wdh.gg/reminders-github`)
                )

            message.reply({ embeds: [info], components: [buttons] });
        } catch(err) {
            client.logCommandError(err, message, Discord);
        }
    }
}

export = command;
