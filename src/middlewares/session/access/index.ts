import { createSession, createRedisSession } from "../utils";
import { ACCESS_SESSION_COOKIE_NAME, maxAge } from "./constants";

// export default () =>
//     createRedisSession({
//         redisPrefix: `${ACCESS_SESSION_COOKIE_NAME}:`,
//         sessionName: ACCESS_SESSION_COOKIE_NAME,
//         secret: process.env.SESSION_SECRET as string,
//         maxAge: 1000 * 60 * 60, // 1 hour
//         cookiePath: "/",
//     });
// // TODO replace this with the redis session above ^ after testing
export default () =>
    createSession({
        sessionName: ACCESS_SESSION_COOKIE_NAME,
        secret: process.env.SESSION_SECRET as string,
        maxAge,
        cookiePath: "/",
    });
