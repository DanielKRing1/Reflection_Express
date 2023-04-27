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

type CreateRedisSession = {
    redisPrefix: string;
} & Omit<CreateSession<RedisStore>, "sessionStore">;
/**
 * Create express-session with Redis store
 *
 * @param param0
 * @returns
 */
export const createRedisSession = ({
    redisPrefix,
    sessionName,
    secret,
    maxAge,
    cookiePath,
}: CreateRedisSession) => {
    const redisStore: RedisStore = createRedisStore(redisPrefix);
    return createSession({
        sessionName,
        sessionStore: redisStore,
        secret,
        maxAge,
        cookiePath,
    });
};

/**
 * Connect to Redis store
 *
 * @param prefix
 * @returns
 */
const createRedisStore = (prefix: string): RedisStore => {
    let redisClient = createClient();
    redisClient.connect().catch(console.error);

    return new RedisStore({
        client: redisClient,
        prefix,
    });
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
    return session({
        secret,
        store: sessionStore,
        name: sessionName,
        // Extend expiration of session (= true) if activity is ongoing
        rolling,
        resave: false, // Do not re-submit 'set' action to store when 'session' obj has not been modified
        saveUninitialized: false, // Do not 'create' session in store when 'session' obj has not been modified
        cookie: {
            path: cookiePath,
            // secure: true, // if true only transmit cookie over https
            httpOnly: true, // if true prevent client side JS from reading the cookie
            maxAge,
        },
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
    // 1. Destroy session on server
    await new Promise<boolean>((res, rej) => {
        req.session.destroy((err) => {
            if (err) return rej(err);
            else return res(true);
        });
        // TODO: Check if this is necessary? Or does req.session.destroy() handle this?
        // @ts-ignore
        req.session = null; // Deletes the cookie.
    });

    // 2. Clear cookies from browser
    switch (sessionCookieType) {
        case SessionCookieType.Access:
            clearAccessSessionCookies(res);
            break;
        case SessionCookieType.Refresh:
            clearRefreshSessionCookies(res);
            break;
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
