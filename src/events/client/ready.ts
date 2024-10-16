import Event from "../../classes/Event";
import ExtendedClient from "../../classes/ExtendedClient";

import Discord from "discord.js";
import { exec } from "child_process";
import globalCommands from "../../scripts/global-commands";
import setReminder from "../../util/setReminder";

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

            // Manage timeouts
            async function manageExistingTimeouts() {
                let reminders = await Reminder.find({});
                const dueReminders = reminders.filter(reminder => reminder.due <= Date.now().toString());

                for(const reminder of dueReminders) {
                    await reminder.deleteOne();
                    reminders = reminders.filter(r => r !== reminder);

                    const embed = new Discord.EmbedBuilder()
                        .setColor(client.config.embeds.default)
                        .setTitle("Overdue Reminder")
                        .setDescription(reminder.reason)
                        .addFields (
                            { name: "Set", value: `<t:${reminder.set.toString().slice(0, -3)}:f>`, inline: true },
                            { name: "Overdue Since", value: `<t:${reminder.due.toString().slice(0, -3)}:R>`, inline: true }
                        )
                        .setFooter({ text: `ID: ${reminder.reminder_id}` })
                        .setTimestamp()

                    if(reminder?.send_in_channel && reminder?.channel) {
                        try {
                            const channel = client.channels.cache.get(reminder.channel) as Discord.TextChannel;

                            if(!channel) throw "Channel not found.";

                            await channel.send({ content: `<@${reminder.user}>`, embeds: [embed] });
                        } catch {
                            try {
                                const user = client.users.cache.get(reminder.user);

                                await user.send({ embeds: [embed] });
                            } catch {}
                        }
                    } else {
                        try {
                            const user = client.users.cache.get(reminder.user);

                            await user.send({ embeds: [embed] });
                        } catch {
                            try {
                                const channel = client.channels.cache.get(reminder?.channel) as Discord.TextChannel;

                                if(!channel) return;

                                await channel.send({ content: `<@${reminder.user}>`, embeds: [embed] });
                            } catch {}
                        }
                    }
                }

                for(const reminder of reminders) {
                    await setReminder(reminder, client);
                }
            }

            manageExistingTimeouts().then(async () => {
                setInterval(async () => {
                    const reminders = await Reminder.find({});

                    if(reminders.length === 0) return;

                    for(const reminder of reminders) {
                        if(client.reminders.get(`${reminder.user}-${reminder.reminder_id}`)) continue;

                        await setReminder(reminder, client);
                    }
                }, 60000)
            })
        } catch(err) {
            client.logError(err);
        }
    }
}

export = event;
