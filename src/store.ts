/**
 * maps (discord id) -> osu username
 */
export const store = new Map<string, string>();

import * as ids from "./ids.json";

if (ids !== undefined) {
    //@ts-ignore
    ids.default.forEach((pair) => store.set(pair.discord, pair.osu));
}
