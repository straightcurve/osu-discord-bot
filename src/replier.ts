import { Message } from "discord.js";
import { parse } from "./parser";

let replies: any = {};

export function register_reply(
    command: string,
    handler: (command: string[], message: Message) => any
) {
    replies[command] = handler;
}

/**
 *
 * @param command
 * @param did the sender's discord id
 */
export function reply(message: Message) {
    let parsed = parse(message.content);
    if (!(parsed[0] in replies)) return false;

    try {
        replies[parsed[0]](parsed.slice(1), message);
    } catch (ex) {
        console.trace(ex);

        message.channel.send("try again, tiny brain (");
    }
}
