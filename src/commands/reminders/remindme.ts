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
            description: "Use \"s\" for seconds, \"m\" for minutes, \"h\" for hours, or \"d\" for days.",
            min_length: 2,
            max_length: 6,
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

            const timeValue = time.slice(0, -1) as unknown as number;
            const timeUnit = time.toLowerCase().slice(-1);
    
            // Error checking
            if(isNaN(timeValue) || timeValue <= 0) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} Invalid time unit. Use \`s\` for seconds, \`m\` for minutes, \`h\` for hours, or \`d\` for days.`)

                await interaction.editReply({ embeds: [error] });
                return;
            }
    
            // Convert time to milliseconds
            switch (timeUnit) {
                case "s": // seconds
                    time = timeValue * 1000;
                    break;
                case "m": // minutes
                    time = timeValue * 60 * 1000;
                    break;
                case "h": // hours
                    time = timeValue * 60 * 60 * 1000;
                    break;
                case "d": // days
                    time = timeValue * 24 * 60 * 60 * 1000;
                    break;
                default:
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} Invalid time unit. Use \`s\` for seconds, \`m\` for minutes, \`h\` for hours, or \`d\` for days.`)

                    await interaction.editReply({ embeds: [error] });
                    return;
            }

            if(time > 2**31 - 1) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} Please provide a valid time! (Cannot be more than 24 days)`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const id = randomUUID().slice(0, 8);

            const reminder = await new Reminder({
                id: id,
                user: interaction.user.id,
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
                await Reminder.findOneAndDelete({ id: id, user: interaction.user.id });
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
