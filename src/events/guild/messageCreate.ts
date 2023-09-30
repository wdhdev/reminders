import Event from "../../classes/Event";
import ExtendedClient from "../../classes/ExtendedClient";
import { Message, PermissionResolvable } from "discord.js";

import Command from "../../classes/Command";

import { emojis as emoji, main } from "../../config";

const cooldowns = new Map();

const event: Event = {
    name: "messageCreate",
    once: false,
    async execute(client: ExtendedClient, Discord: typeof import("discord.js"), message: Message) {
        try {
            const requiredPerms: PermissionResolvable = ["SendMessages", "EmbedLinks"];

            if(message.author.bot || !message.guild) return;
            if(!message.guild.members.me.permissions.has(requiredPerms)) return;

            if(message.content.startsWith(`<@!${client.user.id}>`) || message.content.startsWith(`<@${client.user.id}>`)) {
                const mention = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`👋 Hello there **${message.author.globalName || message.author.username}**,\n\n😊 My name is **${client.user.username}** and I am a reminder bot.\n🕰️ I can remind you of things you need to do, or just send you a message at a certain time!\n\n✨ To get started with me, you can use the command \`${main.prefix}help\`.`)
                    .setTimestamp()

                const buttons: any = new Discord.ActionRowBuilder()
                    .addComponents (
                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Link)
                            .setLabel("Invite")
                            .setURL(`https://wdh.gg/reminders`),

                        new Discord.ButtonBuilder()
                            .setStyle(Discord.ButtonStyle.Link)
                            .setLabel("GitHub")
                            .setURL(`https://wdh.gg/reminders-github`)
                    )

                message.reply({ embeds: [mention], components: [buttons] });
                return;
            }

            if(!message.content.toLowerCase().startsWith(main.prefix.toLowerCase())) return;

            const args = message.content.slice(main.prefix.length).split(/ +/);

            const cmd = args.shift().toLowerCase();
            const command: Command = client.commands.get(cmd) || client.commands.find(c => c.aliases && c.aliases.includes(cmd));

            if(!command) return;

            if(!command.enabled) {
                const disabled = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} This command has been disabled!`)

                message.reply({ embeds: [disabled] });
                return;
            }

            const validPermissions = client.validPermissions;

            if(command.botPermissions.length) {
                const invalidPerms = [];

                for(const perm of command.botPermissions as any) {
                    if(!validPermissions.includes(perm)) return;

                    if(!message.guild.members.me.permissions.has(perm)) invalidPerms.push(perm);
                }

                if(invalidPerms.length) {
                    const permError = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`I am missing these permissions: \`${invalidPerms.join("\`, \`")}\``)

                    message.reply({ embeds: [permError] });
                    return;
                }
            }

            if(message.author.id === main.owner) {
                try {
                    await command.execute(message, args, cmd, client, Discord);
                } catch(err) {
                    client.logError(err);

                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} There was an error while executing that command!`)

                    message.reply({ embeds: [error] });
                }

                return;
            }

            if(!cooldowns.has(command.name)) cooldowns.set(command.name, new Discord.Collection());

            const currentTime = Date.now();
            const timeStamps = cooldowns.get(command.name);
            const cooldownAmount = command.cooldown * 1000;

            if(timeStamps.has(message.author.id)) {
                const expirationTime = timeStamps.get(message.author.id) + cooldownAmount;

                if(currentTime < expirationTime) {
                    const timeLeft: string = (((expirationTime - currentTime) / 1000).toFixed(0)).toString();

                    const cooldown = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`⏰ Please wait ${timeLeft} second${timeLeft === "1" ? "" : "s"} before running that command again!`)

                    message.reply({ embeds: [cooldown] });
                    return;
                }
            }

            timeStamps.set(message.author.id, currentTime);

            setTimeout(() => {
                timeStamps.delete(message.author.id);
            }, cooldownAmount)

            try {
                await command.execute(message, args, cmd, client, Discord);
            } catch(err) {
                client.logError(err);

                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} There was an error while executing that command!`)

                message.reply({ embeds: [error] });
            }
        } catch(err) {
            client.logError(err);
        }
    }
}

export = event;
