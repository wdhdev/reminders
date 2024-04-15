import Command from "../../classes/Command";
import ExtendedClient from "../../classes/ExtendedClient";
import { CommandInteraction } from "discord.js";

import cap from "../../util/cap";
import { emojis as emoji } from "../../config";

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
    async execute(interaction: CommandInteraction, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            const fullReasons = interaction.options.get("full_reasons")?.value || false;

            const reminders = await Reminder.find({ user: interaction.user.id });

            if(!reminders.length) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You do not have any reminders set.`)

                await interaction.editReply({ embeds: [error] });
                return;
            }

            const list = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setTitle("Your Reminders")
                .setDescription(cap(reminders.map(r => `\`${r.reminder_id}\` (<t:${r.due.toString().slice(0, -3)}:R>):\n*${!fullReasons ? cap(r.reason, 100): r.reason}*`).join("\n"), 4000))

            await interaction.editReply({ embeds: [list] });
        } catch(err) {
            client.logCommandError(err, interaction, Discord);
        }
    }
}

export = command;
