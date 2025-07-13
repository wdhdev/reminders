import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { AutocompleteInteraction, ChatInputCommandInteraction, ColorResolvable } from "discord.js";

import { emojis as emoji } from "../../../config.json";

import Reminder from "../../models/Reminder";

const command: Command = {
    name: "cancel",
    description: "Cancel a reminder.",
    options: [
        {
            type: 3,
            name: "id",
            description: "The ID of the reminder to cancel.",
            min_length: 8,
            max_length: 8,
            required: true,
            autocomplete: true
        }
    ],
    default_member_permissions: null,
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    deferReply: true,
    ephemeral: true,
    async execute(
        interaction: ChatInputCommandInteraction,
        client: ExtendedClient,
        Discord: typeof import("discord.js")
    ) {
        try {
            const id = interaction.options.get("id")?.value as string;

            const reminder = await Reminder.findOne({
                reminder_id: id,
                user: interaction.user.id
            });

            if (!reminder) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config.embeds.error as ColorResolvable)
                    .setDescription(`${emoji.cross} I could not find that reminder!`);

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const timeoutId = `${interaction.user.id}-${id}`;

            // Clear reminder
            clearTimeout(client.reminders.get(timeoutId));
            client.reminders.delete(timeoutId);

            await reminder.deleteOne();

            const cancelled = new Discord.EmbedBuilder()
                .setColor(client.config.embeds.default as ColorResolvable)
                .setDescription(`${emoji.tick} The reminder \`${id}\` has been cancelled!`);

            await interaction.editReply({ embeds: [cancelled] });
        } catch (err) {
            client.logCommandError(err, interaction, Discord);
        }
    },
    async autocomplete(interaction: AutocompleteInteraction, client: ExtendedClient) {
        const option = interaction.options.getFocused(true);

        if (option.name === "id") {
            // Fetch user's reminders
            const reminders = await Reminder.find({
                user: interaction.user.id
            });

            // Filter reminders
            const filteredReminders = reminders.filter((reminder) => reminder.reminder_id.startsWith(option.value));

            // Map reminders
            const choices = filteredReminders.map((reminder) => {
                return {
                    name: reminder.reminder_id,
                    value: reminder.reminder_id
                };
            });

            // Set options
            await interaction.respond(choices);
        }
    }
};

export = command;
