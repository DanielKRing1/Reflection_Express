import { Request, Response } from "express";

import signJwt from "../auth/jwt/sign.jwt";
import {
    META_ACCESS_SESSION_COOKIE_NAME,
    maxAge as accessMaxAge,
} from "../middlewares/session/access/constants";
import {
    COOKIE_ARGS_PROTECTED,
    COOKIE_ARGS_LAX,
} from "../middlewares/session/constants";
import {
    REFRESH_SESSION_COOKIE_NAME,
    META_REFRESH_SESSION_COOKIE_NAME,
    maxAge as refreshMaxAge,
} from "../middlewares/session/refresh/constants";
import { Dict } from "../types/global.types";

export const addAccessCookies = (
    userId: string,
    req: Request,
    res: Response
) => {
    // 1. Add non http-only 'meta' cookie (so client can check maxAge, etc...)
    addMetaCookie(META_ACCESS_SESSION_COOKIE_NAME, accessMaxAge, res);

    // 2. Add access cookie
    req.session.userId = userId;
};

export const regenAccessCookies = async (
    userId: string,
    req: Request,
    res: Response
) => {
    // 1. Regen access session cookie
    // Regen existing session
    try {
        // NOTE: This code block throws am undefined error for some reason...
        // However, it seems to not be an issue if caught
        if (req.session.userId !== undefined) {
            await new Promise((reject, resolve) =>
                req.session.regenerate((err) => {
                    if (err) return reject(err);
                    return resolve();
                })
            );
        }
    } catch (err) {
        console.log(err);
    }

    // 2. Add non http-only 'meta' cookie (so client can check maxAge, etc...)
    addAccessCookies(userId, req, res);
};

export const addRefreshCookies = async (
    userId: string,
    req: Request,
    res: Response
) => {
    // 1. Add refresh jwt cookie
    const payload: Dict<any> = {
        userId,
    };
    const jwt: string = await signJwt(payload, process.env.JWT_SECRET!, {
        expiresIn: Date.now() + refreshMaxAge, // Expires in 30 days
    });

    res.cookie(REFRESH_SESSION_COOKIE_NAME, jwt, {
        ...COOKIE_ARGS_PROTECTED,
        expires: new Date(Date.now() + refreshMaxAge),
        path: "/refresh",
    });

    // 2. Add refresh meta cookie
    addMetaCookie(META_REFRESH_SESSION_COOKIE_NAME, refreshMaxAge, res);
};

/**
 * Adds a cookie with 'expires' meta data to the Express Response object
 *
 * @param res Express Response object
 */
const addMetaCookie = (name: string, maxAge: number, res: Response) => {
    // 1. Add non http-only 'meta' cookie (so client can check maxAge, etc...)
    res.cookie(
        name,
        JSON.stringify({ expires: new Date(Date.now() + maxAge) }),
        {
            ...COOKIE_ARGS_LAX,
            maxAge,
        }
    ); // options is optional
};
