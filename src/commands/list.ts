import Command from "../classes/Command";
import ExtendedClient from "../classes/ExtendedClient";
import { Message } from "discord.js";

import { emojis as emoji, main } from "../config";
import cap from "../util/cap";

const command: Command = {
    name: "list",
    description: "Get a list of your reminders.",
    aliases: ["reminders"],
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    async execute(message: Message, args: string[], cmd: Command, client: ExtendedClient, Discord: any) {
        try {
            const reminders = client.reminders.filter(r => r.user === message.author.id);

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
                .setDescription(cap(reminders.map(r => `\`${r.id}\` (<t:${(r.set + r.timestamp).toString().slice(0, -3)}:R>):\n*${cap(r.reason, 50)}*`).join("\n"), 2000))
                .setFooter({ text: `Use "${main.prefix}info <id>" for more information.` })

            message.reply({ embeds: [list] });
        } catch(err) {
            client.logCommandError(err, message, Discord);
        }
    }
}

export = command;
