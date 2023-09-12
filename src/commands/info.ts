import Command from "../classes/Command";
import ExtendedClient from "../classes/ExtendedClient";
import { Message } from "discord.js";

import { emojis as emoji } from "../config";
import cap from "../util/cap";

const command: Command = {
    name: "info",
    description: "Get information about one of your reminders.",
    aliases: ["i", "reminder"],
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    async execute(message: Message, args: string[], cmd: Command, client: ExtendedClient, Discord: any) {
        try {
            const id = args[0];

            if(!id) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} Please specify a reminder ID!`)

                message.reply({ embeds: [error] });
                return;
            }

            const reminder = client.reminders.find(r => r.user === message.author.id && r.id === id);

            if(!reminder) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} I could not find that reminder!`)

                message.reply({ embeds: [error] });
                return;
            }

            const info = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle(`🔔 ${id}`)
                .setDescription(cap(reminder.reason, 2000))
                .addFields(
                    { name: "Set", value: `<t:${reminder.set.toString().slice(0, -3)}:f>`, inline: true },
                    { name: "Goes off", value: `<t:${(reminder.set + reminder.timestamp).toString().slice(0, -3)}:R>`, inline: true }
                )

            message.reply({ embeds: [info] });
        } catch(err) {
            client.logCommandError(err, message, Discord);
        }
    }
}

export = command;
