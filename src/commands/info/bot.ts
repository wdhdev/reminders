import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

const bot = require("../../../package.json");

const command: Command = {
    name: "bot",
    description: "Different information about the bot.",
    options: [],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            const info = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setAuthor({ name: client.user.tag, iconURL: client.user.displayAvatarURL({ extension: "png", forceStatic: false }), url: `https://discord.com/users/${client.user.id}` })
                .setDescription(bot.description)
                .addFields (
                    { name: "📈 Version", value: bot.version, inline: true },
                    { name: "🟢 Online Since", value: `<t:${(Date.now() - client.uptime).toString().slice(0, -3)}:f>`, inline: true },
                    { name: "🔔 Active Reminders", value: `${client.reminders.size}`, inline: true },
                    { name: "📊 Guild Count", value: `${client.guilds.cache.size}`, inline: true },
                    { name: "🔍 Shard ID", value: `${client.shard.ids[0] + 1} / ${client.shard.count + 1}` }
                )

            const buttons: any = new Discord.ActionRowBuilder()
                .addComponents (
                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setEmoji("🔗")
                        .setLabel("Invite")
                        .setURL("https://wdh.gg/reminders"),

                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setEmoji("🆘")
                        .setLabel("Support")
                        .setURL("https://wdh.gg/reminders-support"),

                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setEmoji("🗳️")
                        .setLabel("Vote")
                        .setURL("https://wdh.gg/reminders-vote"),

                    new Discord.ButtonBuilder()
                        .setStyle(Discord.ButtonStyle.Link)
                        .setEmoji("🐙")
                        .setLabel("GitHub")
                        .setURL("https://wdh.gg/reminders-github")
                )

            await interaction.editReply({ embeds: [info], components: [buttons] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
