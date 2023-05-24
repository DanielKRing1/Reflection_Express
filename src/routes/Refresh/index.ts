import { Request, Response, Router } from "express";
import axios from "axios";

import refreshPromise from "../../middlewares/session/refresh";
import {
    META_REFRESH_SESSION_COOKIE_NAME,
    maxAge as refreshMaxAge,
} from "../../middlewares/session/refresh/constants";
import verifyJwtMiddleware from "../../middlewares/jwt/verifyJwt.middleware";
import { Dict } from "../../types/global.types";
import {
    SessionCookieType,
    destroySession,
} from "../../middlewares/session/utils";
import signJwt from "../../auth/jwt/sign.jwt";
import { mergeCookies, HttpCookieResponse } from "../../utils/cookies";
import { COOKIE_ARGS_LAX } from "../../middlewares/session/constants";
import { getFullHost } from "../../utils/path";

export default async (): Promise<Router> => {
    const refresh = await refreshPromise();

    const logoutController = [
        refresh,
        async function (req: Request<{}, {}, {}>, res: Response) {
            try {
                console.log("refresh/logout---------------------------");

                // 1. Destroy session and clear access session cookies from browser
                await destroySession(req, res, SessionCookieType.Refresh);

                return res.send("Success");
            } catch (err) {
                console.log(err);
                return res.status(401).send("Unauthenticated");
            }
        },
    ];

    /**
     * Creates new access session
     * AND
     * Regenerates refresh session
     */
    type LoginGetRefreshBody = {
        jwt: string;
    };
    const refreshController = [
        refresh,
        async function (req: Request<{}, {}, {}>, res: Response) {
            try {
                // 1. Check if has session
                const { userId } = req.session;
                if (userId === undefined)
                    throw new Error("/refresh received no session.userId");

                // 2. Regenerate session if > half expired
                console.log(
                    `Refresh cookie expires at: ${req.session?.cookie
                        ?.expires!}`
                );
                if (
                    Date.now() - req.session?.cookie?.expires!.getTime() >
                    refreshMaxAge / 2
                )
                    await regenRefreshCookies(req, res);

                // 3. Get new access token
                // 3.1. Create jwt
                const payload: Dict<any> = {
                    userId,
                };
                const jwt: string = await signJwt(
                    payload,
                    process.env.JWT_SECRET!,
                    {
                        expiresIn: 10, // Expires in 10 secs
                    }
                );
                // 3.2. Send jwt to '/login/get-access'
                const responseWCookie = await axios.post(
                    // TODO Put this in config file
                    `${getFullHost(req)}/login/get-access`,
                    { jwt }
                );

                // 4. Add refresh cookie to res.cookie
                mergeCookies(responseWCookie as HttpCookieResponse, res);

                res.send("Success");
            } catch (err) {
                console.log(err);
                // 1. Destroy session on error and clear refresh cookies from client
                await destroySession(req, res, SessionCookieType.Refresh);

                return res.status(401).send("Unauthenticated");
            }
        },
    ];

    const getRefreshController = [
        verifyJwtMiddleware,
        refresh,
        async function (
            req: Request<{}, {}, LoginGetRefreshBody>,
            res: Response
        ) {
            try {
                console.log("/refresh/get-refresh---------------------------");

                // 1. Get jwt
                const jwtPayload = req.jwtPayload as Dict<any>;

                // 2. Verify jwt
                const { userId } = jwtPayload;

                // 3. Add userId to access session
                addRefreshCookies(userId, req, res);

                return res.send("Look for cookie");
            } catch (err) {
                console.log(err);
                // 1. Destroy session on error and clear access session cookies from browser
                await destroySession(req, res, SessionCookieType.Refresh);

                return res.status(401).send("Unauthenticated");
            }
        },
    ];

    // ROUTER

    const router: Router = Router({ mergeParams: true });

    router.route("/").post(refreshController);
    router.route("/logout").post(logoutController);

    router.route("/get-refresh").post(getRefreshController);

    return router;
};

const addRefreshCookies = (userId: string, req: Request, res: Response) => {
    // 1. Add non http-only 'meta' cookie (so client can check maxAge, etc...)
    createMetaCookie(res);

    // 2. Add refresh cookie
    req.session.userId = userId;
};

const regenRefreshCookies = async (req: Request, res: Response) => {
    // 1. Add non http-only 'meta' cookie (so client can check maxAge, etc...)
    createMetaCookie(res);

    // 2. Regen refresh cookie
    new Promise((reject, resolve) =>
        req.session.regenerate((err) => {
            if (err) return reject(err);
            return resolve();
        })
    );
};

/**
 * Adds a cookie with 'expires' meta data to the Express Response object
 *
 * @param res Express Response object
 */
const createMetaCookie = (res: Response) => {
    // 1. Add non http-only 'meta' cookie (so client can check maxAge, etc...)
    res.cookie(
        META_REFRESH_SESSION_COOKIE_NAME,
        JSON.stringify({ expires: new Date(Date.now() + refreshMaxAge) }),
        {
            // Not "/refresh" bcus cookie should be accessible from any client page
            path: "/",
            maxAge: refreshMaxAge,
            ...COOKIE_ARGS_LAX,
        }
    ); // options is optional
};
