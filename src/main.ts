import "./bot";
import { get_client_id, on_message } from "./bot";
import { parse_recent, reply_recent } from "./commands/recent";
import { parse_set, reply_set } from "./commands/set";
import { parse_user, reply_user } from "./commands/user";
import { register } from "./parser";
import { register_reply, reply } from "./replier";


register("set", parse_set);
register("s", parse_set);
register("recent", parse_recent);
register("r", parse_recent);
register("user", parse_user);
register("u", parse_user);

register_reply("recent", reply_recent);
register_reply("r", reply_recent);
register_reply("set", reply_set);
register_reply("s", reply_set);
register_reply("user", reply_user);
register_reply("u", reply_user);

on_message(async (message) => {
    if (message.author.id === get_client_id())
        return;

    try {
        reply(message);
    } catch (ex) {
        console.trace(ex);

        message.channel.send("try again, tiny brain (");
    }
});
