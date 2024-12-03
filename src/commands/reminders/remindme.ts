import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { ChatInputCommandInteraction, ColorResolvable, TextChannel } from "discord.js";

import { emojis as emoji } from "../../../config.json";

import Reminder from "../../models/Reminder";

const command: Command = {
    name: "remindme",
    description: "Set a reminder.",
    options: [
        {
            type: 3,
            name: "time",
            description: "Use \"mo\" for months, \"d\" for days, \"h\" for hours, \"m\" for minutes, or \"s\" for seconds.",
            min_length: 2,
            max_length: 16,
            required: true
        },

        {
            type: 3,
            name: "reason",
            description: "The reason for the reminder.",
            max_length: 1000,
            required: true
        },

        {
            type: 5,
            name: "send_in_channel",
            description: "Send the reminder in this channel, instead of in a direct message.",
            required: false
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: ChatInputCommandInteraction, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            let time: number | string = interaction.options.get("time")?.value as string;
            const reason = interaction.options.get("reason")?.value as string;
            const sendInChannel = interaction.options.get("send_in_channel")?.value || false as boolean;

            const reminders = await Reminder.find({ user: interaction.user.id });

            if(reminders.length >= client.config.reminders.max) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config.embeds.error as ColorResolvable)
                    .setDescription(`${emoji.cross} You can only have up to ${client.config.reminders.max} active reminder${client.config.reminders.max === 1 ? "" : "s"} at once!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const timeRegex = /^(\d+mo)?(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/;
            time = time.toLowerCase().replace(/\s/g, "");
            const match = timeRegex.exec(time);

            if(!match) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config.embeds.error as ColorResolvable)
                    .setDescription(`${emoji.cross} Invalid time format. Use \`mo\` for months, \`d\` for days, \`h\` for hours, \`m\` for minutes, or \`s\` for seconds.`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            // Get matched time values
            const months = match[1] ? parseInt(match[1]) : 0;
            const days = match[2] ? parseInt(match[2]) : 0;
            const hours = match[3] ? parseInt(match[3]) : 0;
            const minutes = match[4] ? parseInt(match[4]) : 0;
            const seconds = match[5] ? parseInt(match[5]) : 0;

            // Time is in milliseconds
            const second = 1000;
            const minute = 60 * second;
            const hour = 60 * minute;
            const day = 24 * hour;
            const month = 30 * day;

            time = (months * month) + (days * day) + (hours * hour) + (minutes * minute) + (seconds * second);

            const maxReminderTimeDays = Math.floor(client.config.reminders.maxTime / (24 * 60 * 60 * 1000));

            if(time > client.config.reminders.maxTime) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config.embeds.error as ColorResolvable)
                    .setDescription(`${emoji.cross} Your reminder cannot be more than ${maxReminderTimeDays} day${maxReminderTimeDays === 1 ? "" : "s"} in the future.`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const reminder = await new Reminder({
                user: interaction.user.id,
                channel: interaction.channel?.id ? interaction.channel?.id : null,
                delay: time,
                reason: reason,
                send_in_channel: sendInChannel
            }).save()

            if(time < client.config.reminders.timeTillSet) {
                client.reminders.set(`${interaction.user.id}-${reminder.reminder_id}`, setTimeout(async () => {
                    client.reminders.delete(`${interaction.user.id}-${reminder.reminder_id}`);
                    await Reminder.findOneAndDelete({ reminder_id: reminder.reminder_id, user: interaction.user.id });

                    const embed = new Discord.EmbedBuilder()
                        .setColor(client.config.embeds.default as ColorResolvable)
                        .setTitle("Reminder")
                        .setDescription(reason)
                        .addFields (
                            { name: "Set", value: `<t:${reminder.reminder_set.toString().slice(0, -3)}:f> (<t:${reminder.reminder_set.toString().slice(0, -3)}:R>)` }
                        )
                        .setFooter({ text: `ID: ${reminder.reminder_id}` })
                        .setTimestamp()

                    
                    if(sendInChannel && interaction.channel?.id) {
                        try {
                            const channel = client.channels.cache.get(interaction.channel?.id) as TextChannel;

                            if(!channel) throw "Channel not found.";

                            await channel.send({ content: `${interaction.user}`, embeds: [embed] });
                        } catch {
                            try {
                                await interaction.user.send({ embeds: [embed] });
                            } catch {}
                        }
                    } else {
                        try {
                            await interaction.user.send({ embeds: [embed] });
                        } catch {
                            const channel = client.channels.cache.get(interaction.channel?.id) as TextChannel;

                            if(!channel) return;

                            await channel.send({ content: `${interaction.user}`, embeds: [embed] });
                        }
                    }
                }, time))
            }

            const reminderSet = new Discord.EmbedBuilder()
                .setColor(client.config.embeds.default as ColorResolvable)
                .setDescription(`${emoji.tick} Your reminder has been set for <t:${reminder.reminder_due.toString().slice(0, -3)}:f> with ID \`${reminder.reminder_id}\`!`)

            await interaction.editReply({ embeds: [reminderSet] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
