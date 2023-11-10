import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { AutocompleteInteraction, CommandInteraction } from "discord.js";

import { emojis as emoji } from "../../config";

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
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            const id = interaction.options.get("id").value;

            const reminder = await Reminder.findOne({ id: id, user: interaction.user.id });

            if(!reminder) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} I could not find that reminder!`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const info = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle(reminder.id)
                .addFields(
                    { name: "Reason", value: reminder.reason },
                    { name: "Set", value: `<t:${reminder.set.toString().slice(0, -3)}:f>`, inline: true },
                    { name: "Due", value: `<t:${reminder.due.toString().slice(0, -3)}:R>`, inline: true }
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