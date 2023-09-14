import Command from "../classes/Command";
import ExtendedClient from "../classes/ExtendedClient";
import { Message } from "discord.js";

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
    async execute(message: Message, args: string[], cmd: Command, client: ExtendedClient, Discord: any) {
        try {
            let time: number | string = args[0];
            const reason = args.slice(1).join(" ");

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

            if(reason.length > 250) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} Your reason cannot be more than 250 characters!`)

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
                        .setDescription(`${emoji.cross} Invalid time unit specified. Use \`s\` for seconds, \`m\` for minutes, \`h\` for hours, or \`d\` for days.`)

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

            const reminders = await Reminder.find({ user: message.author.id });

            if(reminders.length >= 10) {
                const error = new Discord.EmbedBuilder()
                    .setColor(client.config_embeds.error)
                    .setDescription(`${emoji.cross} You cannot have more than 10 reminders running at once!`)

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
                    .setTitle("🔔 Reminder")
                    .setDescription(reason)

                message.author.send({ embeds: [embed] }).catch(() => {
                    message.channel.send({ content: `${message.author}`, embeds: [embed] }).catch(() => {});
                })

                client.reminders.delete(`${message.author.id}-${id}`);
                await Reminder.findOneAndDelete({ id: id, user: message.author.id });
            }, time))

            const reminderSet = new Discord.EmbedBuilder()
                .setColor(client.config_embeds.default)
                .setDescription(`${emoji.tick} Your reminder has been set for <t:${reminder.due.toString().slice(0, -3)}:f> with the ID \`${id}\`.`)

            message.reply({ embeds: [reminderSet] });
        } catch(err) {
            client.logCommandError(err, message, Discord);
        }
    }
}

export = command;
