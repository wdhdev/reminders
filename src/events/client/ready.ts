import Event from "../../classes/Event";
import ExtendedClient from "../../classes/ExtendedClient";

import { ColorResolvable, EmbedBuilder, TextChannel } from "discord.js";
import globalCommands from "../../scripts/global-commands";
import setReminder from "../../util/setReminder";

import Reminder from "../../models/Reminder";

const event: Event = {
    name: "ready",
    once: true,
    async execute(client: ExtendedClient) {
        try {
            // Login Message
            console.log(`Logged in as: ${client.user?.tag}`);

            // Register Commands
            if (client.shard.ids[0] === 0) {
                await globalCommands(client);
            }

            // Manage timeouts
            async function manageExistingReminders() {
                let reminders = await Reminder.find({});
                const dueReminders = reminders
                    .filter(reminder => (Number(reminder.reminder_set) + reminder.delay) <= Date.now())
                    // Filter out reminders that are in a channel that the bot can't see
                    .filter(reminder => client.channels.cache.has(reminder.channel));

                for(const reminder of dueReminders) {
                    await reminder.deleteOne();
                    reminders = reminders.filter(r => r !== reminder);

                    const embed = new EmbedBuilder()
                        .setColor(client.config.embeds.default as ColorResolvable)
                        .setTitle("Overdue Reminder")
                        .setDescription(reminder.reason)
                        .addFields (
                            { name: "Set", value: `<t:${reminder.reminder_set.toString().slice(0, -3)}:f>`, inline: true },
                            { name: "Overdue Since", value: `<t:${(Number(reminder.reminder_set) + reminder.delay).toString().slice(0, -3)}:R>`, inline: true }
                        )
                        .setFooter({ text: `ID: ${reminder.reminder_id}` })
                        .setTimestamp()

                    const recurring = new EmbedBuilder()
                        .setColor(client.config.embeds.default as ColorResolvable)
                        .setDescription("This reminder was a recurring reminder, however since it was sent overdue, it has been reset, you will need to set it again if you want it to continue.")

                    if(reminder?.send_in_channel && reminder.channel) {
                        try {
                            const channel = client.channels.cache.get(reminder.channel) as TextChannel;

                            if(!channel) throw "Channel not found.";

                            await channel.send({ content: `<@${reminder.user}>`, embeds: reminder?.recurring ? [embed, recurring] : [embed] });
                        } catch {
                            try {
                                const user = client.users.cache.get(reminder.user);

                                await user?.send({ embeds: reminder?.recurring ? [embed, recurring] : [embed] });
                            } catch {}
                        }
                    } else {
                        try {
                            const user = client.users.cache.get(reminder.user);

                            await user?.send({ embeds: reminder?.recurring ? [embed, recurring] : [embed] });
                        } catch {
                            try {
                                const channel = client.channels.cache.get(reminder.channel) as TextChannel;

                                if(!channel) return;

                                await channel.send({ content: `<@${reminder.user}>`, embeds: reminder?.recurring ? [embed, recurring] : [embed] });
                            } catch {}
                        }
                    }
                }

                for(const reminder of reminders) {
                    await setReminder(reminder, client);
                }
            }

            manageExistingReminders().then(async () => {
                setInterval(async () => {
                    const reminders = (await Reminder.find({})).filter(reminder => client.channels.cache.has(reminder.channel));

                    if(!reminders.length) return;

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
