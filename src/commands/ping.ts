import Command from "../classes/Command";
import ExtendedClient from "../classes/ExtendedClient";
import { Message } from "discord.js";

import { emojis as emoji } from "../config";

const command: Command = {
    name: "ping",
    description: "Get the bot's latency.",
    aliases: ["latency"],
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    async execute(message: Message, args: string[], cmd: Command, client: ExtendedClient & any, Discord: any) {
        try {
            const latency = Date.now() - message.createdTimestamp;

            let latencyValue;

            if(latency >= 0 && latency <= 99) {
                latencyValue = `${emoji.connection_excellent} ${latency}ms`;
            } else if(latency >= 100 && latency <= 199) {
                latencyValue = `${emoji.connection_good} ${latency}ms`;
            } else {
                latencyValue = `${emoji.connection_bad} ${latency}ms`;
            }

            const ping = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(latencyValue)

            message.reply({ embeds: [ping] });
        } catch(err) {
            client.logCommandError(err, message, Discord);
        }
    }
}

export = command;
