import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { ChatInputCommandInteraction, ColorResolvable } from "discord.js";

import cap from "../../util/cap";
import { emojis as emoji } from "../../../config.json";

import Reminder from "../../models/Reminder";

const command: Command = {
    name: "reminders",
    description: "Get a list of your active reminders.",
    options: [
        {
            type: 5,
            name: "full_reasons",
            description: "View the full reasons of every reminder.",
            required: false
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
            const fullReasons = interaction.options.get("full_reasons")?.value || false;

            let reminders = await Reminder.find({ user: interaction.user.id });

            if(!reminders.length) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config.embeds.error as ColorResolvable)
                    .setDescription(`${emoji.cross} You do not have any reminders set.`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            // Sort reminders by due date
            reminders = reminders.sort((a: any, b: any) => a.due - b.due);

            const list = new Discord.EmbedBuilder()
                .setColor(client.config.embeds.default as ColorResolvable)
                .setTitle("Your Reminders")
                .setDescription(cap(reminders.map(r => `\`${r._id}\` (<t:${r.reminder_due.toString().slice(0, -3)}:R>):\n*${!fullReasons ? cap(r.reason, 100): r.reason}*`).join("\n"), 4000))

            await interaction.editReply({ embeds: [list] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
