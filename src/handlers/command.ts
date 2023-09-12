import ExtendedClient from "../classes/ExtendedClient";
import { Message } from "discord.js";

import fs from "fs";

export = async (client: ExtendedClient) => {
    async function load() {
        const files = fs.readdirSync(`./dist/commands`).filter((file: String) => file.endsWith(".js"));

        for(const file of files) {
            const command = require(`../commands/${file}`);

            client.commands.set(command.name, command);

            console.log(`Loaded Command: ${command.name}`);
        }
    }

    await load();

    client.logCommandError = async function (err: Error, message: Message, Discord: any) {
        const id = client.sentry.captureException(err);
        console.error(err);

        const error = new Discord.EmbedBuilder()
            .setColor(client.config_embeds.error)
            .setTitle("💥 An error occurred")
            .setDescription(`\`\`\`${err.message}\`\`\``)
            .addFields (
                { name: "Error ID", value: id }
            )
            .setTimestamp()

        message.reply({ embeds: [error] });
    }

    require("dotenv").config();
}
