import Command from "../classes/Command";
import ExtendedClient from "../classes/ExtendedClient";
import { Message } from "discord.js";

import { emojis as emoji, main } from "../config";
import fs from "fs";

const command: Command = {
    name: "help",
    description: "Get a list of all the bot's commands.",
    aliases: ["commands"],
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    async execute(message: Message, args: string[], cmd: Command, client: ExtendedClient, Discord: any) {
        try {
            const cmdArg: string = args[0];

            const commands: string[] = [];

            async function push() {
                const files = fs.readdirSync(`./dist/commands`).filter(file => file.endsWith(".js"));

                for(const file of files) {
                    const command = require(`./${file}`);

                    if(command.name) {
                        if(!command.enabled) continue;

                        commands.push(command.name);
                    } else {
                        continue;
                    }
                }
            }

            await push();

            const cmds = [];

            for(const c of commands) {
                const info = client.commands.get(c);

                cmds.push(`\`${main.prefix}${c}\`\n${emoji.reply} ${info.description}`);
            }

            const help = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setThumbnail(client.user.displayAvatarURL({ extension: "png", forceStatic: false }))
                .setTitle("Commands")
                .setDescription(cmds.sort().join("\n"))
                .setTimestamp()


            const command: Command = client.commands.get(cmdArg) || client.commands.find(c => c.aliases && c.aliases.includes(cmdArg));

            if(command && command.enabled) {
                const description = command.description ?? "N/A";
                const aliases = command.aliases.length ? `\`${command.aliases.join("`, `")}\`` : "N/A";
                const botPermissions = command.botPermissions.length ? `\`${command.botPermissions.join("\`, \`")}\`` : "N/A";

                const commandHelp = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle(`Command: ${command.name}`)
                    .addFields (
                        { name: "Description", value: description },
                        { name: "Aliases", value: aliases },
                        { name: "Bot Permissions", value: botPermissions }
                    )
                    .setTimestamp()

                message.reply({ embeds: [commandHelp] });
                return;
            }

            message.reply({ embeds: [help] });
        } catch(err) {
            client.logCommandError(err, message, Discord);
        }
    }
}

export = command;
