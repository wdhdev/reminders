import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { AutocompleteInteraction, CommandInteraction, Interaction, TextChannel } from "discord.js";

import { emojis as emoji } from "../../config";

import Reminder from "../../models/Reminder";

const command: Command = {
    name: "edit",
    description: "Edit a reminder.",
    options: [
        {
            type: 3,
            name: "id",
            description: "The ID of the reminder to edit.",
            min_length: 8,
            max_length: 8,
            required: true,
            autocomplete: true
        },

        {
            type: 3,
            name: "new-reason",
            description: "The new reason for the reminder.",
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
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            const id = interaction.options.get("id").value;
            const newReason = interaction.options.get("new-reason").value as string;

            const reminder = await Reminder.findOne({ reminder_id: id, user: interaction.user.id });

            if(!reminder) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} I could not find that reminder!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            reminder.reason = newReason;
            await reminder.save();

            const timeoutId = `${interaction.user.id}-${id}`;

            // Clear old timeout
            clearTimeout(client.reminders.get(timeoutId));

            reminder.reason = newReason;
            await reminder.save();

            // Set reminder
            client.reminders.set(`${interaction.user.id}-${id}`, setTimeout(async () => {
                const embed = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle("Reminder")
                    .setDescription(newReason)
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
            }, Number(reminder.due) - Date.now()))

            const edited = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} Your reminder has been updated!`)

            await interaction.editReply({ embeds: [edited] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    },
    async autocomplete(interaction: AutocompleteInteraction, client: ExtendedClient) {
        const option = interaction.options.getFocused(true);

        if(option.name === "id") {
            // Fetch user's reminders
            const reminders = await Reminder.find({ user: interaction.user.id });

            // Filter reminders
            const filteredReminders = reminders.filter((reminder) => reminder.id.startsWith(option.value));

            // Map reminders
            const choices = filteredReminders.map((reminder) => {
                return {
                    name: reminder.id,
                    value: reminder.id
                }
            })

            // Set options
            await interaction.respond(choices);
        }
    }
}

export = command;
