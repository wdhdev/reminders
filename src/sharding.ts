import { ShardingManager } from "discord.js";

const manager = new ShardingManager("dist/index.js", {
    token: process.env.TOKEN,
    totalShards: 2
})

manager.on("shardCreate", (shard) => {
    console.log(`Shard Launched: ${shard.id}`);
});

manager.spawn();
