import Command from "../classes/Command";
import ExtendedClient from "../classes/ExtendedClient";
import { Message, TextChannel } from "discord.js";

import { emojis as emoji } from "../config";
import { randomUUID } from "crypto";

import Reminder from "../models/Reminder";

const command: Command = {
    name: "set",
    description: "Set a reminder.",
    aliases: ["remind", "remindme"],
    botPermissions: [],
    cooldown: 5,
    enabled: true,
    async execute(message: Message, args: string[], cmd: Command, client: ExtendedClient, Discord: typeof import("discord.js")) {
        try {
            // Remove flag from args
            const newArgs = args.filter(a => a !== "-i");

            let time: number | string = newArgs[0];
            const reason = newArgs.slice(1).join(" ");
            const flagI = args.includes("-i");

            if(!time) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} Please provide a time!`)

                message.reply({ embeds: [error] });
                return;
            }

            if(!reason) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} Please provide a reason!`)

                message.reply({ embeds: [error] });
                return;
            }

            if(reason.length > 1000) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} Your reason cannot be more than 1000 characters!`)

                message.reply({ embeds: [error] });
                return;
            }

            const timeValue = time.slice(0, -1) as unknown as number;
            const timeUnit = time.toLowerCase().slice(-1);
    
            // Error checking
            if(isNaN(timeValue) || timeValue <= 0) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} Invalid time unit. Use \`s\` for seconds, \`m\` for minutes, \`h\` for hours, or \`d\` for days.`)

                message.reply({ embeds: [error] });
                return;
            }
    
            // Convert time to milliseconds
            switch (timeUnit) {
                case "s": // seconds
                    time = timeValue * 1000;
                    break;
                case "m": // minutes
                    time = timeValue * 60 * 1000;
                    break;
                case "h": // hours
                    time = timeValue * 60 * 60 * 1000;
                    break;
                case "d": // days
                    time = timeValue * 24 * 60 * 60 * 1000;
                    break;
                default:
                    const error = new Discord.EmbedBuilder()
                        .setColor(client.config_embeds.error)
                        .setDescription(`${emoji.cross} Invalid time unit. Use \`s\` for seconds, \`m\` for minutes, \`h\` for hours, or \`d\` for days.`)

                    message.reply({ embeds: [error] });
                    return;
            }

            if(time > 2**31 - 1) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} Please provide a valid time! (Cannot be more than 24 days)`)

                message.reply({ embeds: [error] });
                return;
            }

            const id = randomUUID().slice(0, 8);

            const reminder = await new Reminder({
                id: id,
                user: message.author.id,
                channel: message.channel.id,
                set: Date.now(),
                due: Date.now() + time,
                delay: time,
                reason: reason
            }).save()

            client.reminders.set(`${message.author.id}-${id}`, setTimeout(async () => {
                const embed = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.default)
                    .setTitle("Reminder")
                    .setDescription(reason)
                    .addFields (
                        { name: "Set", value: `<t:${reminder.set.toString().slice(0, -3)}:f> (<t:${reminder.set.toString().slice(0, -3)}:R>)` }
                    )
                    .setFooter({ text: `ID: ${reminder.id}` })
                    .setTimestamp()

                try {
                    await message.author.send({ embeds: [embed] });
                } catch {
                    try {
                        const channel = client.channels.cache.get(message.channel.id) as TextChannel;

                        if(!channel) return;

                        await channel.send({ content: `${message.author}`, embeds: [embed] });
                    } catch {}
                }

                client.reminders.delete(`${message.author.id}-${id}`);
                await Reminder.findOneAndDelete({ id: id, user: message.author.id });
            }, time))

            const reminderSet = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} Your reminder has been set for <t:${reminder.due.toString().slice(0, -3)}:f>${flagI ? ` with the ID \`${reminder.id}\`` : ""}!`)

            if(!flagI) reminderSet.setFooter({ text: "Use the -i flag to get the ID with the response." });

            message.reply({ embeds: [reminderSet] });
        } catch(err) {
            client.logCommandError(err, message, Discord);
        }
    }
}

export = command;
