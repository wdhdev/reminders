require("dotenv").config();

import * as Sentry from "@sentry/node";

Sentry.init({
    dsn: process.env.sentry_dsn,
    tracesSampleRate: 1.0
})

import Discord from "discord.js";
import ExtendedClient from "./classes/ExtendedClient";
import config from "./config";

const client = new ExtendedClient({
    intents: ["Guilds", "GuildMessages"],
    presence: {
        activities: [
            {
                name: "🔔 /remindme",
                type: Discord.ActivityType.Custom
            }
        ],
        status: "online"
    }
})

// Error Handling
process.on("unhandledRejection", (err: Error) => Sentry.captureException(err));

// Connect to Database
import database from "./util/database";
database();

// Configs
client.config_embeds = config.embeds;
client.config_main = config.main;

// Handlers
client.commands = new Discord.Collection();
client.events = new Discord.Collection();

import { loadHandlers } from "./util/functions";
loadHandlers(client);

// Login
client.login(process.env.token);

// Constants
client.commandIds = new Discord.Collection();
client.reminders = new Map();
client.sentry = Sentry;

client.maxReminderTime = 365 * 24 * 60 * 60 * 1000; // 1 year (365 days)
client.timeToSet = 10 * 60 * 1000; // 10 minutes

client.validPermissions = [
    "CreateInstantInvite",
    "KickMembers",
    "BanMembers",
    "Administrator",
    "ManageChannels",
    "ManageGuild",
    "AddReactions",
    "ViewAuditLog",
    "PrioritySpeaker",
    "Stream",
    "ViewChannel",
    "SendMessages",
    "SendTTSMessages",
    "ManageMessages",
    "EmbedLinks",
    "AttachFiles",
    "ReadMessageHistory",
    "MentionEveryone",
    "UseExternalEmojis",
    "ViewGuildInsights",
    "Connect",
    "Speak",
    "MuteMembers",
    "DeafenMembers",
    "MoveMembers",
    "UseVAD",
    "ChangeNickname",
    "ManageNicknames",
    "ManageRoles",
    "ManageWebhooks",
    "ManageEmojisAndStickers",
    "UseApplicationCommands",
    "RequestToSpeak",
    "ManageEvents",
    "ManageThreads",
    "CreatePublicThreads",
    "CreatePrivateThreads",
    "UseExternalStickers",
    "SendMessagesInThreads",
    "UseEmbeddedActivities",
    "ModerateMembers",
    "ViewCreatorMonetizationAnalytics",
    "UseSoundboard",
    "SendVoiceMessages"
]
