import { Message } from "discord.js";
import { parse_set_user, process_set_user, reply_set_user } from "./user";

let params: any = {
    user: parse_set_user,
};

/**
 *  
 * 
 * @param data `user [ 2B ]`
 */
export function parse_set(data: string) {
    let param = data.substring(0, data.indexOf(" "));
    if (!(param in params))
        return [];

    return [ param, ...params[param](data.substring(data.indexOf(" "))) ];
}

let commands: any = {
    user: process_set_user,
};

/**
 * 
 * @param command 
 * @param did the sender's discord id
 */
export function process_set(command: string[], did: string) {
    if (!(command[0] in commands))
        return false;

    return commands[command[0]](command.slice(1), did);
}

let replies: any = {
    user: reply_set_user,
};

/**
 * 
 * @param command 
 * @param did the sender's discord id
 */
export function reply_set(command: string[], message: Message) {
    if (!(command[0] in commands))
        return false;

    return replies[command[0]](command.slice(1), message);
}
