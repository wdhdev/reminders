import Event from "../../classes/Event";
import ExtendedClient from "../../classes/ExtendedClient";

const event: Event = {
    name: "shardDisconnect",
    once: true,
    async execute(client: ExtendedClient, shard: Number) {
        try {
            console.log(`Shard ${shard} has disconnected.`);
        } catch(err) {
            client.logError(err);
        }
    }
}

export = event;
