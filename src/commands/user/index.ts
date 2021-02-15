import { Message, MessageEmbed } from "discord.js";
import { osu } from "../../api";
import { OsuUser } from "../../data/osu-user";
import { store } from "../../store";

/**
 *
 *
 * @param data ``
 */
export function parse_user(data: string) {
    return [];
}

/**
 *
 * @param command
 * @param did the sender's discord id
 */
export async function process_user(
    command: string[],
    did: string
): Promise<UserResult> {
    let oid = store.get(did);
    if (oid === undefined)
        return {
            error: new Error("osu id not set"),
            user: null,
        };

    let token = await osu
        .fetchAccessToken()
        .then((result) => result.access_token)
        .catch((error) => {
            console.trace(error);
            throw error;
        });

    let user = await osu.fetchUser(oid, token);

    return {
        user,
    };
}

interface UserResult {
    error?: Error;
    user: OsuUser | null;
}

export async function reply_user(command: string[], message: Message) {
    let result = await process_user([], message.author.id);
    if (result.error) {
        console.trace(__filename, result.error);
        return await message.channel.send(`try again, tiny brain <@${message.author.id}> (`);
    }
    
    if (result.user === null) 
        return console.trace("null user but no error..?");

    const user = result.user;

    try {
        const reply = new MessageEmbed()
            .setColor("#0099ff")
            .setAuthor(
                format_username(user),
                get_country_flag_link(user),
                format_user_url(user)
            )
            .setThumbnail(user.avatar_url)
            .addFields(
                { name: "Global Rank", value: format_global_rank(user), inline: true },
                { name: "Country Rank", value: format_country_rank(user), inline: true },
                { name: "Accuracy", value: format_accuracy(user), inline: true },
                { name: "Maximum Combo", value: format_combo(user), inline: true },
                {
                    name: "Play Count",
                    value: format_play_count(user),
                    inline: true,
                },
                {
                    name: "disgusting players stat",
                    value: format_pp(user),
                    inline: true,
                },
            )
            .setImage(user.cover_url)
            .setTimestamp(new Date(user.join_date))
            .setFooter(`this user has quit life on`, "https://avatars.githubusercontent.com/u/31109115?s=400&u=884899fcf29184863296f892175cbe5b9777485d&v=4");
    
        await message.channel.send(reply);
    } catch (ex) {
        console.trace(__filename, ex);
        
        await message.channel.send(`try again, tiny brain <@${message.author.id}> (`);
    }
}

function format_user_url(user: OsuUser) {
    return `https://osu.ppy.sh/users/${user.id}`;
}

function format_pp(user: OsuUser) {
    return `${user.statistics.pp}pp`;
}

function format_global_rank(user: OsuUser) {
    return `#${user.statistics.rank.global}`;
}

function get_country_flag_link(user: OsuUser) {
    return `https://flagpedia.net/data/flags/w580/${user.country.code.toLowerCase()}.png`;
}

function format_country_rank(user: OsuUser) {
    return `#${user.statistics.rank.country}`;
}

function format_combo(user: OsuUser) {
    return `${user.statistics.maximum_combo}x`;
}

function format_play_count(user: OsuUser) {
    return `${user.statistics.play_count}`;
}

function format_accuracy(user: OsuUser) {
    return `${(user.statistics.hit_accuracy).toFixed(2)}%`;
}

function format_username(user: OsuUser) {
    return `${user.username}`;
}
