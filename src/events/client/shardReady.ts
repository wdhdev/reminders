import Event from "../../classes/Event";
import ExtendedClient from "../../classes/ExtendedClient";

const event: Event = {
    name: "shardReady",
    once: true,
    async execute(client: ExtendedClient, shard: Number) {
        try {
            console.log(`Shard ${shard} is online.`);
        } catch(err) {
            client.logError(err);
        }
    }
}

export = event;
