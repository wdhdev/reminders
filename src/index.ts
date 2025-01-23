import "./lib/sentry";
import config from "../config.json";
require("dotenv").config();

import Discord from "discord.js";
import ExtendedClient from "./classes/ExtendedClient";

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

// Config
client.config = config;

// Error Handling
import * as Sentry from "@sentry/node";

process.on("unhandledRejection", (err: Error) => Sentry.captureException(err));

// Connect to Database
import mongo from "./lib/mongo";
mongo();

// Handlers
client.commands = new Discord.Collection();
client.events = new Discord.Collection();

import { loadHandlers } from "./util/functions";
loadHandlers(client);

// Login
client.login(process.env.TOKEN);

// Constants
client.commandIds = new Discord.Collection();
client.reminders = new Map();

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
    "SendVoiceMessages",
    "SendPolls",
    "UseExternalApps"
]
