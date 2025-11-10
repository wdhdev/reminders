import Event from "../../classes/Event";
import ExtendedClient from "../../classes/ExtendedClient";
import { ColorResolvable, Message, PermissionResolvable } from "discord.js";

const event: Event = {
    name: "messageCreate",
    once: false,
    async execute(client: ExtendedClient, Discord: typeof import("discord.js"), message: Message) {
        try {
            const requiredPerms: PermissionResolvable = ["SendMessages", "EmbedLinks"];

            // Ignore messages sent by bots
            if (message.author.bot) return;
            // Ignore messages if the bot does not have the required permissions
            if (!message.guild?.members.me?.permissions.has(requiredPerms)) return;

            if (
                message.content.startsWith(`<@!${client.user?.id}>`) ||
                message.content.startsWith(`<@${client.user?.id}>`)
            ) {
                const mention = new Discord.EmbedBuilder()
                    .setColor(client.config.embeds.default as ColorResolvable)
                    .setDescription(
                        `👋 Hello there **${message.author.globalName || message.author.username}**!\n\n👤 My name is **${client.user?.username}** and I am a reminder bot.\n⏰ I can remind you of things you need to do, or just send you a message at a certain time!\n\n✨ To get started with me, use the command: </help:${client.commandIds.get("help")}>`
                    )
                    .setTimestamp();

                const buttons: any = new Discord.ActionRowBuilder().addComponents(
                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setEmoji("🔗")
                        .setLabel("Invite")
                        .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user?.id}`),

                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setEmoji("🗳️")
                        .setLabel("Vote")
                        .setURL(`https://top.gg/bot/${client.user?.id}/vote`),

                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setEmoji("🐙")
                        .setLabel("GitHub")
                        .setURL("https://github.com/wdhdev/reminders")
                );

                message.reply({ embeds: [mention], components: [buttons] });
                return;
            }
        } catch (err) {
            client.logError(err);
        }
    }
};

export = event;
