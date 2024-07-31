import { ColorResolvable } from "discord.js";

const embeds = {
    default: "#0096FF" as ColorResolvable,
    error: "#E74C3C" as ColorResolvable
}

const emojis = {
    connection_bad: "",
    connection_excellent: "",
    connection_good: "",
    cross: "",
    ping: "",
    reply: "",
    tick: ""
}

const main = {
    maxReminderTime: 365 * 24 * 60 * 60 * 1000, // 1 year (365 days)
    owner: "",
    timeToSet: 10 * 60 * 1000 // 10 minutes
}

export {
    embeds,
    emojis,
    main
}

export default {
    embeds,
    emojis,
    main
}
