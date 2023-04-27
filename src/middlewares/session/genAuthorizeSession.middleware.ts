import { SessionData } from "express-session";
import { MiddlewareFunc } from "../types";
import genSessionMiddleware from "./genSession.middleware";

/**
 * This middleware generator returns the provided express-session
 *
 * This may be redundant.
 * My thought is that by creating this middleware generator,
 *  sessions will not be directly added as middleware,
 *  and instead, it will be more clear that sessions can simply be added but that they may also need to be 'authorized'
 */
export default (sessionMiddleware: MiddlewareFunc): MiddlewareFunc[] => [
    genSessionMiddleware(sessionMiddleware),
    (req, res, next) => {
        try {
            // 1. Did not receive a valid session, throw error
            const { userId }: SessionData = req.session;
            if (userId === undefined)
                throw new Error(
                    "genAuthorizeSession middleware did not find a session for the received request: terminate request"
                );

            // 2. Received a valid session
            next();
        } catch (err) {
            console.log(err);

            return res.status(401).send("Unauthenticated");
        }
    },
];
