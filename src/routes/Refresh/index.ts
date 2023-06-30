import { Request, Response, Router } from "express";

import accessPromise from "../../middlewares/session/access";
import {
    REFRESH_SESSION_COOKIE_NAME,
    maxAge as refreshMaxAge,
} from "../../middlewares/session/refresh/constants";
import { Dict } from "../../types/global.types";
import {
    SessionCookieType,
    destroySession,
} from "../../middlewares/session/utils";
import verifyJwt from "../../auth/jwt/verify.jwt";
import {
    addRefreshCookies,
    regenAccessCookies,
} from "../../utils/sessionCookies";

export default async (): Promise<Router> => {
    const access = await accessPromise();

    /**
     * Creates new access session
     * AND
     * Regenerates refresh session
     */
    type LoginGetRefreshBody = {
        jwt: string;
    };
    const refreshController = [
        access,
        async function (req: Request<{}, {}, {}>, res: Response) {
            try {
                // 1. Get refresh cookie in jwt form
                const cookies = req.cookies;
                const jwtRefreshCookie: string =
                    cookies[REFRESH_SESSION_COOKIE_NAME];

                // console.log("refresh endpoint cookie----");
                // console.log(cookies);
                // console.log(Object.keys(cookies));
                // console.log(jwtRefreshCookie);

                // 2. Get refresh cookie as object, will throw error if fails
                const refreshCookie: Dict<any> = await verifyJwt(
                    jwtRefreshCookie,
                    process.env.JWT_SECRET!
                );

                const userId: string = refreshCookie.userId;
                // console.log("refresh userId:");
                // console.log(userId);

                // 3. Regen any existing access cookies
                //      Or create new new ones
                await regenAccessCookies(userId, req, res);

                // 4. Regenerate refresh cookie if > half expired
                if (refreshCookie.expiresIn - Date.now() < refreshMaxAge / 2) {
                    console.log("regenerating refresh cookies");
                    await addRefreshCookies(userId, req, res);
                }

                res.send("Success");
            } catch (err) {
                console.log(err);
                // 1. Destroy session on error and clear refresh cookies from client
                await destroySession(req, res, SessionCookieType.Refresh);

                return res.status(401).send("Unauthenticated");
            }
        },
    ];

    // ROUTER

    const router: Router = Router({ mergeParams: true });

    router.route("/").post(refreshController);

    return router;
};
