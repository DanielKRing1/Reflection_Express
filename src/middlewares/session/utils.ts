import session from "express-session";
import { createClient } from "redis";
import RedisStore from "connect-redis";
import { Request, Response } from "express";
import {
    ACCESS_SESSION_COOKIE_NAME,
    META_ACCESS_SESSION_COOKIE_NAME,
} from "./access/constants";
import {
    META_REFRESH_SESSION_COOKIE_NAME,
    REFRESH_SESSION_COOKIE_NAME,
} from "./refresh/constants";
import { clearCookieFromBrowser } from "../../utils/cookies";
import { COOKIE_ARGS_PROTECTED } from "./constants";

type CreateRedisSession = {
    redisPrefix: string;
} & Omit<CreateSession<RedisStore>, "sessionStore">;
/**
 * Create express-session with Redis store
 *
 * @param param0
 * @returns
 */
export const createRedisSession = async ({
    redisPrefix,
    sessionName,
    secret,
    maxAge,
    cookiePath,
}: CreateRedisSession) => {
    const redisStore: RedisStore = await createRedisStore(redisPrefix);
    return createSession({
        sessionName,
        sessionStore: redisStore,
        secret,
        maxAge,
        cookiePath,
    });
};

let redisStore: RedisStore;
/**
 * Connect to Redis store
 *
 * @param prefix
 * @returns
 */
const createRedisStore = async (prefix: string): Promise<RedisStore> => {
    if (redisStore === undefined) {
        const redisClient = createClient({
            url: process.env.REDIS_URL,
        });
        // redisClient.connect().catch(console.error);

        redisClient.on("error", (err: Error) => {
            console.log("Redis client error:");
            console.log(process.env);
            console.log(process.env.REDIS_URL);
            console.log(err);
        });
        await redisClient.connect();

        redisStore = new RedisStore({
            client: redisClient,
            prefix,
        });
    }

    return redisStore;
};

type CreateSession<T> = {
    sessionName: string;
    sessionStore?: T;
    secret: string;
    rolling?: boolean;
    maxAge: number;
    cookiePath: string;
};
/**
 * Create express-session
 *
 * @param param0
 * @returns
 */
export const createSession = ({
    sessionName,
    sessionStore,
    secret,
    rolling = false,
    maxAge,
    cookiePath,
}: CreateSession<any>) => {
    const cookie = {
        ...COOKIE_ARGS_PROTECTED,
        path: cookiePath,
        maxAge,
    };

    return session({
        secret,
        store: sessionStore,
        name: sessionName,
        // Extend expiration of session (= true) if activity is ongoing
        rolling,
        resave: false, // Do not re-submit 'set' action to store when 'session' obj has not been modified
        saveUninitialized: false, // Do not 'create' session in store when 'session' obj has not been modified
        cookie,
    });
};

export enum SessionCookieType {
    Access,
    Refresh,
}
/**
 * Explicitly destroy a session on the server and remove from session store
 *
 * @param req
 */
export const destroySession = async (
    req: Request,
    res: Response,
    sessionCookieType: SessionCookieType
) => {
    try {
        // 1. Destroy session on server
        await new Promise<boolean>((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) return reject(err);
                else return resolve(true);
            });
            // TODO: Check if this is necessary? Or does req.session.destroy() handle this?
            // @ts-ignore
            req.session = null; // Deletes the cookie.

            // 2. Clear cookies from browser
            switch (sessionCookieType) {
                case SessionCookieType.Access:
                    clearAccessSessionCookies(res);
                    break;
                case SessionCookieType.Refresh:
                    clearRefreshSessionCookies(res);
                    break;
            }
        });
    } catch (err) {
        console.log(err);
    }
};

const clearAccessSessionCookies = (res: Response) => {
    clearCookieFromBrowser(ACCESS_SESSION_COOKIE_NAME, res);
    clearCookieFromBrowser(META_ACCESS_SESSION_COOKIE_NAME, res);
};

const clearRefreshSessionCookies = (res: Response) => {
    clearCookieFromBrowser(REFRESH_SESSION_COOKIE_NAME, res);
    clearCookieFromBrowser(META_REFRESH_SESSION_COOKIE_NAME, res);
};
