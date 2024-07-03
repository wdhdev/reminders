import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { ChatInputCommandInteraction, TextChannel } from "discord.js";

import { emojis as emoji } from "../../config";
import { randomUUID } from "crypto";

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
            let time: number | string = interaction.options.get("time").value as string;
            const reason = interaction.options.get("reason").value as string;

            const reminders = await Reminder.find({ user: interaction.user.id });

            if(reminders.length >= 10) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You can only have up to 10 active reminders at once!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const timeRegex = /^(\d+mo)?(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/;
            time = time.toLowerCase().replace(/\s/g, "");
            const match = timeRegex.exec(time);

            if(!match) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
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

            const maxReminderTimeDays = Math.floor(client.maxReminderTime / (24 * 60 * 60 * 1000));

            if(time > client.maxReminderTime) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} Your reminder cannot be more than ${maxReminderTimeDays} day${maxReminderTimeDays === 1 ? "" : "s"} in the future.`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const id = randomUUID().slice(0, 8) as string;

            const reminder = await new Reminder({
                reminder_id: id,
                user: interaction.user.id,
                guild: interaction.guild.id,
                channel: interaction.channel.id,
                set: Date.now(),
                due: Date.now() + time,
                delay: time,
                reason: reason
            }).save()

            if(time < client.timeToSet) {
                client.reminders.set(`${interaction.user.id}-${id}`, setTimeout(async () => {
                    client.reminders.delete(`${interaction.user.id}-${id}`);
                    await Reminder.findOneAndDelete({ reminder_id: id, user: interaction.user.id });

                    const embed = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setTitle("Reminder")
                        .setDescription(reason)
                        .addFields (
                            { name: "Set", value: `<t:${reminder.set.toString().slice(0, -3)}:f> (<t:${reminder.set.toString().slice(0, -3)}:R>)` }
                        )
                        .setFooter({ text: `ID: ${reminder.reminder_id}` })
                        .setTimestamp()

                    try {
                        await interaction.user.send({ embeds: [embed] });
                    } catch {
                        try {
                            const channel = client.channels.cache.get(interaction.channel.id) as TextChannel;

                            if(!channel) return;

                            await channel.send({ content: `${interaction.user}`, embeds: [embed] });
                        } catch {}
                    }
                }, time))
            }

            const reminderSet = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} Your reminder has been set for <t:${reminder.due.toString().slice(0, -3)}:f> with ID \`${reminder.reminder_id}\`!`)

            await interaction.editReply({ embeds: [reminderSet] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
