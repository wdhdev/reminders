import Command from "../classes/Command";
import ExtendedClient from "../classes/ExtendedClient";
import { Message } from "discord.js";

import cap from "../util/cap";
import { emojis as emoji, main } from "../config";

import Reminder from "../models/Reminder";

const command: Command = {
    name: "list",
    description: "Get a list of your reminders.",
    aliases: ["l", "ls", "reminders"],
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    async execute(message: Message, args: string[], cmd: Command, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            // If user is an admin, get reminders for a specific user
            // Allow fetching user by mention or id
            const user = message.mentions.users.first() || client.users.cache.get(args[0]?.match(/[0-9]{17,19}/)?.[0]) || message.author;

            if(user.id !== message.author.id && main.owner === message.author.id) {
                const reminders = await Reminder.find({ user: user.id });

                if(!reminders.length) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} <@${user.id}> does not have any reminders set.`)

                    message.reply({ embeds: [error] });
                    return;
                }

                const list = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setAuthor({ name: user.tag.endsWith("#0") ? user.username : user.tag, iconURL: user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${user.id}` })
                    .setTitle(`${user.globalName || user.username}'s Reminders`)
                    .setDescription(cap(reminders.map(r => `\`${r.id}\` (<t:${r.due.toString().slice(0, -3)}:R>):\n*${cap(r.reason, 50)}*`).join("\n"), 2000))

                message.reply({ embeds: [list] });
                return;
            }

            const reminders = await Reminder.find({ user: message.author.id });

            if(!reminders.length) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You do not have any reminders set.`)

                message.reply({ embeds: [error] });
                return;
            }

            const list = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("Your Reminders")
                .setDescription(cap(reminders.map(r => `\`${r.id}\` (<t:${r.due.toString().slice(0, -3)}:R>):\n*${cap(r.reason, 50)}*`).join("\n"), 2000))
                .setFooter({ text: `Use "${main.prefix}info <id>" for more information.` })

            message.reply({ embeds: [list] });
        } catch(err) {
            client.logCommandError(err, message, Discord);
        }
    }
}

export = command;
