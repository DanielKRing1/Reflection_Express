import { createSession, createRedisSession } from "../utils";

export const ACCESS_SESSION_COOKIE_NAME = "rfltn-access";
export const maxAge = 1000 * 60 * 60; // 1 hour

// export default createRedisSession({
//   redisPrefix: "rfltn-access:",
//   sessionName: "rfltn-access",
//   secret: process.env.SESSION_SECRET as string,
//   maxAge: 1000 * 60 * 60, // 1 hour
//   cookiePath: "/",
// });
// TODO replace this with the redis session above ^ after testing
export default createSession({
    sessionName: ACCESS_SESSION_COOKIE_NAME,
    secret: process.env.SESSION_SECRET as string,
    maxAge,
    cookiePath: "/",
});
