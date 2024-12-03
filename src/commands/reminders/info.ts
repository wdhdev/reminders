import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { AutocompleteInteraction, ChatInputCommandInteraction, ColorResolvable } from "discord.js";

import { emojis as emoji } from "../../../config.json";

import Reminder from "../../models/Reminder";

const command: Command = {
    name: "info",
    description: "Get information about a reminder.",
    options: [
        {
            type: 3,
            name: "id",
            description: "The ID of the reminder to get information about.",
            min_length: 8,
            max_length: 8,
            required: true,
            autocomplete: true
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 10,
    enabled: true,
    deferReply: true,
    ephemeral: true,
    async execute(interaction: ChatInputCommandInteraction, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            const id = interaction.options.get("id")?.value as string;

            const reminder = await Reminder.findOne({ reminder_id: id, user: interaction.user.id });

            if(!reminder) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config.embeds.error as ColorResolvable)
                    .setDescription(`${emoji.cross} I could not find that reminder!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const info = new Discord.EmbedBuilder()
                .setColor(client.config.embeds.default as ColorResolvable)
                .setTitle(reminder.reminder_id)
                .addFields(
                    { name: "Reason", value: reminder.reason },
                    { name: "Set", value: `<t:${reminder.reminder_set.toString().slice(0, -3)}:f>`, inline: true },
                    { name: "Due", value: `<t:${(reminder.reminder_set + reminder.delay).toString().slice(0, -3)}:R>`, inline: true }
                )

            await interaction.editReply({ embeds: [info] });
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
            const filteredReminders = reminders.filter((reminder) => reminder.reminder_id.startsWith(option.value));

            // Map reminders
            const choices = filteredReminders.map((reminder) => {
                return {
                    name: reminder.reminder_id,
                    value: reminder.reminder_id
                }
            })

            // Set options
            await interaction.respond(choices);
        }
    }
}

export = command;
