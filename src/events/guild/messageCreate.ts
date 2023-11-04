import Event from "../../classes/Event";
import ExtendedClient from "../../classes/ExtendedClient";
import { Message, PermissionResolvable } from "discord.js";

import cap from "../../util/plainCap";
import { emojis as emoji, main } from "../../config";

const event: Event = {
    name: "messageCreate",
    once: false,
    async execute(client: ExtendedClient, Discord: typeof import("discord.js"), message: Message) {
        try {
            const requiredPerms: PermissionResolvable = ["SendMessages", "EmbedLinks"];

            // Ignore messages sent by bots
            if(message.author.bot) return;
            // Ignore messages if the bot does not have the required permissions
            if(!message.guild.members.me.permissions.has(requiredPerms)) return;

            // Temporary prefix deprecation message
            if(message.content.startsWith(main.prefix)) {
                const prefixDeprecation = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle("Prefix Deprecation")
                    .setDescription(`⚠️ The prefix \`${main.prefix}\` is deprecated. Please use slash commands instead.`)
                    .addFields (
                        { name: "Why?", value: "The Reminders bot has been forced to move to slash commands due to Discord not approving us for the [message content intent](https://discord.com/developers/docs/topics/gateway#message-content-intent), which is required for the bot to function properly." }
                    )

                message.reply({ embeds: [prefixDeprecation] });
                return;
            }

            if(message.content.startsWith(`<@!${client.user.id}>`) || message.content.startsWith(`<@${client.user.id}>`)) {
                const args = message.content.slice(`<@${client.user.id}>`.length).trim().split(/ +/g);
                const command = args.shift().toLowerCase();

                // eval
                if(command === "eval" && message.author.id === main.owner) {
                    try {
                        if(!args[0]) {
                            const error = new Discord.EmbedBuilder()
                                .setColor(client.config_embeds.error)
                                .setDescription(`${emoji.cross} No code was provided.`)

                            message.reply({ embeds: [error] });
                            return;
                        }

                        console.log(`[eval] [input] ${message.author.tag} (${message.author.id}): ${args.join(" ")}`);

                        const evalInput = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setTitle("📥 Input")
                            .setDescription(`\`\`\`js\n${cap(args.join(" "), 4000)}\`\`\``)
                            .setTimestamp()

                        const evaluating = new Discord.EmbedBuilder()
                            .setColor(client.config_embeds.default)
                            .setDescription(`${emoji.ping} Evaluating...`)

                        const msg = await message.reply({ embeds: [evaluating] });

                        try {
                            // Run the code
                            let output: string = await eval(args.join(" "));

                            if(output !== null && output !== undefined) {
                                output = output.toString();

                                // Censor the database URL, Sentry DSN and bot token if they are returned
                                if(output.includes(process.env.database) && process.env.database) output = output.replace(process.env.database, "[CENSORED_DATABASE_URL]");
                                if(output.includes(process.env.sentry_dsn) && process.env.sentry_dsn) output = output.replace(process.env.sentry_dsn, "[CENSORED_SENTRY_DSN]");
                                if(output.includes(process.env.token) && process.env.token) output = output.replace(process.env.token, "[CENSORED_BOT_TOKEN]");

                                console.log(`[eval] [output] ${message.author.tag} (${message.author.id}):\n` + output);

                                const evalOutput = new Discord.EmbedBuilder()
                                    .setColor(client.config_embeds.default)
                                    .setTitle("📤 Output")
                                    .setDescription(`\`\`\`js\n${cap(output, 4000)}\`\`\``)
                                    .setTimestamp()

                                msg.edit({ embeds: [evalInput, evalOutput] });
                            } else {
                                console.log(`[eval] [output] ${message.author.tag} (${message.author.id}):\n` + output);

                                const evalOutput = new Discord.EmbedBuilder()
                                    .setColor(client.config_embeds.error)
                                    .setTitle("📤 Output")
                                    .setDescription("No output was returned.")
                                    .setTimestamp()

                                msg.edit({ embeds: [evalInput, evalOutput] });
                            }
                        } catch(err) {
                            // Censor the database URL, Sentry DSN and bot token if they are returned
                            if(err.message.includes(process.env.database) && process.env.database) err.message = err.message.replace(process.env.database, "[CENSORED_MONGODB_URI]");
                            if(err.message.includes(process.env.sentry_dsn) && process.env.sentry_dsn) err.message = err.message.replace(process.env.sentry_dsn, "[CENSORED_SENTRY_DSN]");
                            if(err.message.includes(process.env.token) && process.env.token) err.message = err.message.replace(process.env.token, "[CENSORED_BOT_TOKEN]");

                            console.log(`[eval] [error] ${message.author.tag} (${message.author.id}):\n` + err);

                            const evalOutput = new Discord.EmbedBuilder()
                                .setColor(client.config_embeds.error)
                                .setTitle("📤 Output")
                                .setDescription(`\`\`\`js\n${cap(err.message, 4000)}\`\`\``)
                                .setTimestamp()

                            msg.edit({ embeds: [evalInput, evalOutput] });
                        }
                    } catch(err) {
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

                    return;
                }

                const mention = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setDescription(`👋 Hello there **${message.author.globalName || message.author.username}**!\n\n👤 My name is **${client.user.username}** and I am a reminder bot.\n⏰ I can remind you of things you need to do, or just send you a message at a certain time!\n\n✨ To get started with me, use the command: </help:${client.commandIds.get("help")}>`)
                    .setTimestamp()

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

                message.reply({ embeds: [mention], components: [buttons] });
                return;
            }
        } catch(err) {
            client.logError(err);
        }
    }
}

export = event;
