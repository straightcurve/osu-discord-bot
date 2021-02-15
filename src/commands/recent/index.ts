import { Message, MessageEmbed } from "discord.js";
import { osu } from "../../api";
import { Score } from "../../data/score";
import { store } from "../../store";

/**
 *
 *
 * @param data ``
 */
export function parse_recent(data: string) {
    return [];
}

/**
 *
 * @param command
 * @param did the sender's discord id
 */
export async function process_recent(
    command: string[],
    did: string
): Promise<RecentResult> {
    let oid = store.get(did);
    if (oid === undefined)
        return {
            error: new Error("osu id not set"),
            scores: [],
        };

    let token = await osu
        .fetchAccessToken()
        .then((result) => result.access_token)
        .catch((error) => {
            console.trace(error);
            throw error;
        });

    let scores = await osu.fetchRecentScores(oid, token);

    return {
        scores,
    };
}

interface RecentResult {
    error?: Error;
    scores: Score[];
}

export async function reply_recent(command: string[], message: Message) {
    let result = await process_recent([], message.author.id);
    if (result.error) console.trace(result.error);

    const score = result.scores[0];
    const score_message = new MessageEmbed()
        .setColor("#0099ff")
        .setTitle(format_played_by(score))
        .setURL(format_user_url(score))
        .setAuthor(
            format_title(score),
            score.beatmapset.covers.list,
            score.beatmap.url
        )
        .setThumbnail(score.user.avatar_url)
        .addFields(
            { name: "Rank", value: format_rank(score), inline: true },
            { name: "Accuracy", value: format_accuracy(score), inline: true },
            { name: "Combo", value: format_combo(score), inline: true },
            {
                name: "Difficulty",
                value: format_difficulty(score),
                inline: true,
            },
            {
                name: "AR",
                value: score.beatmap.ar,
                inline: true,
            },
            {
                name: "CS",
                value: score.beatmap.cs,
                inline: true,
            },
            {
                name: "OD",
                value: score.beatmap.accuracy,
                inline: true,
            },
            {
                name: "HP",
                value: score.beatmap.drain,
                inline: true,
            },
            {
                name: "disgusting players stat",
                value: format_pp(score),
                inline: true,
            },
        )
        .setImage(score.beatmapset.covers.cover)
        .setTimestamp(new Date(score.created_at))
        .setFooter(`don't trashtalk the bot if you suck at the game`, "https://avatars.githubusercontent.com/u/31109115?s=400&u=884899fcf29184863296f892175cbe5b9777485d&v=4");

    message.channel.send(score_message);
}

function format_user_url(score: Score) {
    return `https://osu.ppy.sh/users/${score.user.id}`;
}

function format_pp(score: Score) {
    return `${score.pp}pp`;
}

function format_rank(score: Score) {
    return `${score.rank}`;
}

function format_combo(score: Score) {
    return `${score.max_combo}x / Unknown`;
}

function format_difficulty(score: Score) {
    return `${score.beatmap.difficulty_rating}★`;
}

function format_title(score: Score) {
    let mods = score.mods.length > 0 ? ` +${score.mods.join("")}` : "";

    return `${score.beatmapset.artist} - ${score.beatmapset.title} [ ${score.beatmap.version} ]${mods}`;
}

function format_accuracy(score: Score) {
    return `${(score.accuracy * 100).toFixed(2)}%`;
}

function format_played_by(score: Score) {
    return `played by ${score.user.username}`;
}
