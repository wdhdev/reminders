import { ColorResolvable } from "discord.js";

const embeds = {
    default: "#0096FF" as ColorResolvable,
    error: "#E74C3C" as ColorResolvable
}

const emojis = {
    connection_bad: "<:connection_bad:1149583879179612250>",
    connection_excellent: "<:connection_excellent:1149583873538260992>",
    connection_good: "<:connection_good:1149583875551539280>",
    cross: "<:cross:1149583869956329492>",
    ping: "<a:ping:1149583866684780626>",
    reply: "<:reply:1149583863333519390>",
    tick: "<:tick:1149583861416730695>"
}

const main = {
    prefix: "r!",
    owner: "853158265466257448"
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
