import Event from "../../classes/Event";
import ExtendedClient from "../../classes/ExtendedClient";

import Discord from "discord.js";

import Reminder from "../../models/Reminder";

const event: Event = {
    name: "ready",
    once: true,
    async execute(client: ExtendedClient) {
        try {
            // Login Message
            console.log(`Logged in as: ${client.user.tag.endsWith("#0") ? client.user.username : client.user.tag}`);

            // Manage timeouts
            let reminders = await Reminder.find({});

            const dueReminders = reminders.filter(reminder => reminder.due <= Date.now().toString());

            for(const reminder of dueReminders) {
                const user = client.users.cache.get(reminder.user);

                const embed = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle("🔔 Overdue Reminder")
                    .setDescription(reminder.reason)
                    .addFields (
                        { name: "Set", value: `<t:${reminder.set.toString().slice(0, -3)}:f>`, inline: true },
                        { name: "Overdue since", value: `<t:${reminder.due.toString().slice(0, -3)}:R>`, inline: true }
                    )
                    .setFooter({ text: `ID: ${reminder.id}` })
                    .setTimestamp()

                try {
                    user.send({ embeds: [embed] });
                } catch {
                    try {
                        const channel = client.channels.cache.get(reminder.channel) as Discord.TextChannel;

                        channel.send({ content: `<@${reminder.user}>`, embeds: [embed] });
                    } catch {}
                }

                await reminder.delete();
                reminders = reminders.filter(r => r !== reminder);
            }

            for(const reminder of reminders) {
                const delay = Number(reminder.due) - Date.now();

                const timeout = setTimeout(async () => {
                    const user = client.users.cache.get(reminder.user);

                    const embed = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setTitle("🔔 Reminder")
                        .setDescription(reminder.reason)
                        .addFields (
                            { name: "Set", value: `<t:${reminder.set.toString().slice(0, -3)}:f>` }
                        )
                        .setFooter({ text: `ID: ${reminder.id}` })
                        .setTimestamp()

                    try {
                        user.send({ embeds: [embed] });
                    } catch {
                        try {
                            const channel = client.channels.cache.get(reminder.channel) as Discord.TextChannel;

                            channel.send({ content: `<@${reminder.user}>`, embeds: [embed] });
                        } catch {}
                    }

                    await reminder.delete();
                    client.reminders.delete(`${reminder.user}-${reminder.id}`);
                }, delay);

                client.reminders.set(`${reminder.user}-${reminder.id}`, timeout);
            }
        } catch(err) {
            client.logError(err);
        }
    }
}

export = event;
