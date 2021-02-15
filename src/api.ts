import { AccessTokenResult } from "./data/access-token-result";
import { OsuUser } from "./data/osu-user";
import { Score } from "./data/score";

//@ts-ignore
const fetch = require("node-fetch");

const {
    osu_client_id: client_id,
    osu_client_secret: secret,
} = require("dotenv").config().parsed;

const base_url = "https://osu.ppy.sh/api/[version]";
const v1 = base_url.replace("[version]", "v1");
const v2 = base_url.replace("[version]", "v2");
const token_url = "https://osu.ppy.sh/oauth/token";
const search_url = `${v2}/token`;

class OsuAPI {
    public fetchAccessToken(): Promise<AccessTokenResult> {
        return fetch(token_url, {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                grant_type: "client_credentials",
                client_id: client_id,
                client_secret: secret,
                scope: "public",
            }),
        })
            .then((response: any) => response.json())
            .then((response: AccessTokenResult) => {
                if (response.error) throw new Error(response.error);

                return response;
            })
            .catch((error: Error) => {
                console.trace(error);
            });
    }

    public fetchAllUserScores(id: string, token: string): Promise<Score[]> {
        const page1 = this.getBestScoresUrl(id, 0, 1);
        const page2 = this.getBestScoresUrl(id, 1, 0);

        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };

        return Promise.all([
            fetch(page1, {
                method: "GET",
                headers: headers,
            }).then((response: any) => response.json()),

            fetch(page2, {
                method: "GET",
                headers: headers,
            }).then((response: any) => response.json()),
        ])
            .then((responses: Array<Array<Score>>) => {
                return responses[0].concat(responses[1]);
                // return responses.flat() as Score[];
            })
            .catch((error: Error) => {
                console.trace(error);

                throw error;
            });
    }

    public fetchRecentScores(id: string, token: string): Promise<Score[]> {
        const url = this.getRecentScoresUrl(id, 0, 1);

        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };

        return fetch(url, {
            method: "GET",
            headers: headers,
        })
            .then((response: any) => response.json())
            .catch((error: Error) => {
                console.trace(error);

                throw error;
            });
    }

    public fetchUser(id: string, token: string): Promise<OsuUser> {
        const url = new URL(`${v2}/users/${id}/osu`);

        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };

        return fetch(url, {
            method: "GET",
            headers: headers,
        })
            .then((response: any) => response.json())
            .catch((error: Error) => {
                console.trace(error);

                throw error;
            });
    }

    public findUserIdByUsername(
        username: string,
        token: string
    ): Promise<string> {
        const url = new URL(search_url);

        let params = {
            mode: "all",
            query: username.replace(/\s/g, "_"),
            page: "0",
        };
        Object.keys(params).forEach((key) =>
            //@ts-ignore
            url.searchParams.append(key, params[key])
        );

        let headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };

        return fetch(url, {
            method: "GET",
            headers: headers,
        })
            .then((response: any) => response.json())
            .then((results: any[]) => {
                if (results.length === 0) return null;
            })
            .catch((error: Error) => {
                console.trace(error);

                throw error;
            });
    }

    private getBestScoresUrl(
        id: string,
        offset: number = 0,
        limit: number = 50
    ) {
        const url = new URL(`${v2}/users/${id}/scores/best`);

        let params = {
            // include_fails: "1",
            mode: "osu",
            limit: `${limit}`,
            offset: `${offset}`,
        };
        Object.keys(params).forEach((key) =>
            //@ts-ignore
            url.searchParams.append(key, params[key])
        );

        return url;
    }

    private getRecentScoresUrl(
        id: string,
        offset: number = 0,
        limit: number = 50
    ) {
        const url = new URL(`${v2}/users/${id}/scores/recent`);

        let params = {
            include_fails: "1",
            mode: "osu",
            limit: `${limit}`,
            offset: `${offset}`,
        };
        Object.keys(params).forEach((key) =>
            //@ts-ignore
            url.searchParams.append(key, params[key])
        );

        return url;
    }
}

export const osu = new OsuAPI();
