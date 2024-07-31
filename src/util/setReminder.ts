import Discord from "discord.js";
import ExtendedClient from "../classes/ExtendedClient";

export default async function (reminder: any, client: ExtendedClient): Promise<Boolean> {
    const delay = Number(reminder.due) - Date.now();

    if(delay > client.config.main.timeToSet) return false;

    client.reminders.set(`${reminder.user}-${reminder.reminder_id}`, setTimeout(async () => {
        await reminder.deleteOne();
        client.reminders.delete(`${reminder.user}-${reminder.reminder_id}`);

        const embed = new Discord.EmbedBuilder()
            .setColor(client.config.embeds.default)
            .setTitle("Reminder")
            .setDescription(reminder.reason)
            .addFields (
                { name: "Set", value: `<t:${reminder.set.toString().slice(0, -3)}:f> (<t:${reminder.set.toString().slice(0, -3)}:R>)` }
            )
            .setFooter({ text: `ID: ${reminder.reminder_id}` })
            .setTimestamp()

        if(reminder?.send_in_channel) {
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
                    const channel = client.channels.cache.get(reminder.channel) as Discord.TextChannel;

                    if(!channel) return;

                    await channel.send({ content: `<@${reminder.user}>`, embeds: [embed] });
                } catch {}
            }
        }
    }, delay))

    return true;
}