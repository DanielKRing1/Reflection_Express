import { createSession, createRedisSession } from "../utils";
import { REFRESH_SESSION_COOKIE_NAME, maxAge } from "./constants";

export default createRedisSession({
    redisPrefix: `${REFRESH_SESSION_COOKIE_NAME}:`,
    sessionName: REFRESH_SESSION_COOKIE_NAME,
    secret: process.env.SESSION_SECRET as string,
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    // TODO Put in config file to use to also defined refresh route
    cookiePath: "/refresh",
});
// TODO replace this with the redis session above ^ after testing
// export default createSession({
//     sessionName: REFRESH_SESSION_COOKIE_NAME,
//     secret: process.env.SESSION_SECRET as string,
//     maxAge,
//     cookiePath: "/refresh",
// });
