import Command from "../classes/Command";
import ExtendedClient from "../classes/ExtendedClient";
import { Message } from "discord.js";

import { emojis as emoji, main } from "../config";

import Reminder from "../models/Reminder";

const command: Command = {
    name: "info",
    description: "Get information about one of your reminders.",
    aliases: ["i", "reminder"],
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    async execute(message: Message, args: string[], cmd: Command, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            if(args.length >= 2 && main.owner === message.author.id) {
                const user = message.mentions.users.first() || client.users.cache.get(args[0]?.match(/[0-9]{17,19}/)?.[0]) || message.author;
                const id = args[1];

                const reminder = await Reminder.findOne({ id: id, user: user.id });

                if(!reminder) {
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} I could not find that reminder!`)

                    message.reply({ embeds: [error] });
                    return;
                }

                const info = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle(reminder.id)
                    .addFields(
                        { name: "Reason", value: reminder.reason },
                        { name: "Set", value: `<t:${reminder.set.toString().slice(0, -3)}:f>`, inline: true },
                        { name: "Due", value: `<t:${reminder.due.toString().slice(0, -3)}:R>`, inline: true }
                    )

                if(user.id !== message.author.id) info.setAuthor({ name: user.tag.endsWith("#0") ? user.username : user.tag, iconURL: user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${user.id}` });

                message.reply({ embeds: [info] });
                return;
            }

            const id = args[0];

            if(!id) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} Please specify a reminder ID!`)

                message.reply({ embeds: [error] });
                return;
            }

            const reminder = await Reminder.findOne({ id: id, user: message.author.id });

            if(!reminder) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} I could not find that reminder!`)

                message.reply({ embeds: [error] });
                return;
            }

            const info = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle(reminder.id)
                .addFields(
                    { name: "Reason", value: reminder.reason },
                    { name: "Set", value: `<t:${reminder.set.toString().slice(0, -3)}:f>`, inline: true },
                    { name: "Due", value: `<t:${reminder.due.toString().slice(0, -3)}:R>`, inline: true }
                )

            message.reply({ embeds: [info] });
        } catch(err) {
            client.logCommandError(err, message, Discord);
        }
    }
}

export = command;
