import Event from "../../classes/Event";
import ExtendedClient from "../../classes/ExtendedClient";

import Discord from "discord.js";

import globalCommands from "../../scripts/global-commands";

import Reminder from "../../models/Reminder";

const event: Event = {
    name: "ready",
    once: true,
    async execute(client: ExtendedClient) {
        try {
            // Login Message
            console.log(`Logged in as: ${client.user.tag}`);

            // Register Commands
            await globalCommands(client);

            // Update status every 20 seconds
            setInterval(async () => {
                client.user.setPresence({
                    activities: [
                        {
                            name: `🔔 ${client.reminders.size} Active Reminder${client.reminders.size === 1 ? "" : "s"}`,
                            type: Discord.ActivityType.Custom
                        }
                    ],
                    status: "online"
                })
            }, 20000)

            // Manage timeouts
            let reminders = await Reminder.find({});

            const dueReminders = reminders.filter(reminder => reminder.due <= Date.now().toString());

            for(const reminder of dueReminders) {
                const user = client.users.cache.get(reminder.user);

                const embed = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle("Overdue Reminder")
                    .setDescription(reminder.reason)
                    .addFields (
                        { name: "Set", value: `<t:${reminder.set.toString().slice(0, -3)}:f>`, inline: true },
                        { name: "Overdue Since", value: `<t:${reminder.due.toString().slice(0, -3)}:R>`, inline: true }
                    )
                    .setFooter({ text: `ID: ${reminder.id}` })
                    .setTimestamp()

                try {
                    await user.send({ embeds: [embed] });
                } catch {
                    try {
                        const channel = client.channels.cache.get(reminder.channel) as Discord.TextChannel;

                        if(!channel) return;

                        await channel.send({ content: `<@${reminder.user}>`, embeds: [embed] });
                    } catch {}
                }

                await reminder.deleteOne();
                reminders = reminders.filter(r => r !== reminder);
            }

            for(const reminder of reminders) {
                const delay = Number(reminder.due) - Date.now();

                client.reminders.set(`${reminder.user}-${reminder.id}`, setTimeout(async () => {
                    const user = client.users.cache.get(reminder.user);

                    const embed = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.default)
                        .setTitle("Reminder")
                        .setDescription(reminder.reason)
                        .addFields (
                            { name: "Set", value: `<t:${reminder.set.toString().slice(0, -3)}:f>` }
                        )
                        .setFooter({ text: `ID: ${reminder.id}` })
                        .setTimestamp()

                    try {
                        await user.send({ embeds: [embed] });
                    } catch {
                        try {
                            const channel = client.channels.cache.get(reminder.channel) as Discord.TextChannel;

                            if(!channel) return;

                            await channel.send({ content: `<@${reminder.user}>`, embeds: [embed] });
                        } catch {}
                    }

                    await reminder.deleteOne();
                    client.reminders.delete(`${reminder.user}-${reminder.id}`);
                }, delay))
            }
        } catch(err) {
            client.logError(err);
        }
    }
}

export = event;
