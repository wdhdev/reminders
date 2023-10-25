import Command from "../classes/Command";
import ExtendedClient from "../classes/ExtendedClient";
import { Message } from "discord.js";

import { emojis as emoji } from "../config";

import Reminder from "../models/Reminder";

const command: Command = {
    name: "cancel",
    description: "Cancel a reminder.",
    aliases: ["c", "clear", "delete"],
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    async execute(message: Message, args: string[], cmd: Command, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
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

            const timeoutId = `${message.author.id}-${id}`;

            // Clear reminder
            clearTimeout(client.reminders.get(timeoutId));
            client.reminders.delete(timeoutId);

            await reminder.delete();

            const cancelled = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} The reminder \`${id}\` has been cancelled!`)

            message.reply({ embeds: [cancelled] });
        } catch(err) {
            client.logCommandError(err, message, Discord);
        }
    }
}

export = command;
