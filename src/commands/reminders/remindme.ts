import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction, TextChannel } from "discord.js";

import { emojis as emoji } from "../../config";
import { randomUUID } from "crypto";

import Reminder from "../../models/Reminder";

const command: Command = {
    name: "remindme",
    description: "Set a reminder.",
    options: [
        {
            type: 3,
            name: "reason",
            description: "The reason for the reminder.",
            max_length: 1000,
            required: true
        },

        {
            type: 3,
            name: "time",
            description: "Use \"d\" for days, \"h\" for hours, \"m\" for minutes, or \"s\" for seconds.",
            min_length: 2,
            max_length: 16,
            required: true
        },

        {
            type: 5,
            name: "return_id",
            description: "Whether to include the reminder ID in the response.",
            required: false
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            const reason = interaction.options.get("reason").value as string;
            let time: number | string = interaction.options.get("time").value as string;
            const returnId = interaction.options.get("return_id")?.value || false;

            const reminders = await Reminder.find({ user: interaction.user.id });

            if(reminders.length >= 5) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You can only have up to 5 active reminders at once!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const timeRegex = /^(\d+d)?(\d+h)?(\d+m)?(\d+s)?$/;
            time = time.toLowerCase().replace(/\s/g, "");
            const match = timeRegex.exec(time);

            if(!match) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} Invalid time format. Use \`d\` for days, \`h\` for hours, \`m\` for minutes, or \`s\` for seconds.`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const days = match[1] ? parseInt(match[1]) : 0;
            const hours = match[2] ? parseInt(match[2]) : 0;
            const minutes = match[3] ? parseInt(match[3]) : 0;
            const seconds = match[4] ? parseInt(match[4]) : 0;

            time = days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000;

            const maxTime = 24 * 60 * 60 * 1000 * 24;

            if(time > maxTime) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} Your reminder cannot be more than 24 days in the future.`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const id = randomUUID().slice(0, 8);

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

            client.reminders.set(`${interaction.user.id}-${id}`, setTimeout(async () => {
                const embed = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle("Reminder")
                    .setDescription(reason)
                    .addFields (
                        { name: "Set", value: `<t:${reminder.set.toString().slice(0, -3)}:f> (<t:${reminder.set.toString().slice(0, -3)}:R>)` }
                    )
                    .setFooter({ text: `ID: ${reminder.id}` })
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

                client.reminders.delete(`${interaction.user.id}-${id}`);
                await Reminder.findOneAndDelete({ reminder_id: id, user: interaction.user.id });
            }, time))

            const reminderSet = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} Your reminder has been set for <t:${reminder.due.toString().slice(0, -3)}:f>${returnId ? ` with the ID \`${reminder.id}\`` : ""}!`)

            await interaction.editReply({ embeds: [reminderSet] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
