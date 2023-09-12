import Event from "../../classes/Event";
import ExtendedClient from "../../classes/ExtendedClient";

const event: Event = {
    name: "ready",
    once: true,
    async execute(client: ExtendedClient) {
        try {
            // Login Message
            console.log(`Logged in as: ${client.user.tag.endsWith("#0") ? client.user.username : client.user.tag}`);
        } catch(err) {
            client.logError(err);
        }
    }
}

export = event;
