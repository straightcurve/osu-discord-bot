import { Message } from "discord.js";
import { store } from "../../store";

/**
 * .set user [ 2B ]
 * 
 * @param data 
 */
export function parse_set_user(data: string) {
    return [ data.substring(data.indexOf(" ") + 1) ];
}

/**
 * 
 * @param command [ osu_user_id ]
 * @param did the sender's discord id
 */
export function process_set_user(command: string[], did: string): SetUserResult {
    const oid = command[0].trim();
    if (oid.length === 0)
        return {
            error: new Error("user id not specified"),
            message: "Please specify the id.",
        };

    store.set(did, oid);

    return {
        message: (`Successfully assigned ${oid} as your user id.`)
    };
}

interface SetUserResult {
    error?: Error,
    message: string,
}

export async function reply_set_user(command: string[], message: Message) {
    let result = process_set_user(command, message.author.id);
    if (result.error) {
        console.trace(__filename, result.error);
        return await message.channel.send(`try again, tiny brain <@${message.author.id}> (`);
    }

    await message.channel.send(result.message);
}
