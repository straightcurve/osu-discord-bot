import { Client, Message } from "discord.js";
import { config } from "dotenv";

const { discord_token } = config().parsed as {
    discord_token: string;
};

let client = new Client({
    presence: {
        activity: {
            name: "osu!",
            type: "PLAYING",
        },
    },
});

export function get_client_id() {
    return client.user?.id;
}

export function on_message(callback: (message: Message) => void) {
    client.on("message", callback);
}

client.login(discord_token);
