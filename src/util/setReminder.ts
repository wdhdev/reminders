import { ColorResolvable, EmbedBuilder, TextChannel } from "discord.js";

import ExtendedClient from "../classes/ExtendedClient";

import { Reminder } from "../models/Reminder";

export default async function (reminder: Reminder, client: ExtendedClient): Promise<Boolean> {
    const delay = Number(reminder.reminder_set + reminder.delay) - Date.now();

    if(delay > client.config.reminders.timeTillSet) return false;

    client.reminders.set(`${reminder.user}-${reminder.reminder_id}`, setTimeout(async () => {
        await reminder.deleteOne();
        client.reminders.delete(`${reminder.user}-${reminder.reminder_id}`);

        const embed = new EmbedBuilder()
            .setColor(client.config.embeds.default as ColorResolvable)
            .setTitle("Reminder")
            .setDescription(reminder.reason)
            .addFields (
                { name: "Set", value: `<t:${reminder.reminder_set.toString().slice(0, -3)}:f> (<t:${reminder.reminder_set.toString().slice(0, -3)}:R>)` }
            )
            .setFooter({ text: `ID: ${reminder.reminder_id}` })
            .setTimestamp()

        if(reminder?.send_in_channel && reminder?.channel) {
            try {
                const channel = client.channels.cache.get(reminder.channel) as TextChannel;

                if(!channel) throw "Channel not found.";

                await channel.send({ content: `<@${reminder.user}>`, embeds: [embed] });
            } catch {
                try {
                    const user = client.users.cache.get(reminder.user);

                    await user?.send({ embeds: [embed] });
                } catch {}
            }
        } else {
            try {
                const user = client.users.cache.get(reminder.user);

                await user?.send({ embeds: [embed] });
            } catch {
                try {
                    const channel = client.channels.cache.get(reminder.channel) as TextChannel;

                    if(!channel) return;

                    await channel.send({ content: `<@${reminder.user}>`, embeds: [embed] });
                } catch {}
            }
        }
    }, delay))

    return true;
}
