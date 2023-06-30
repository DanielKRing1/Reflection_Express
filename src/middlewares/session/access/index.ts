import { createSession, createRedisSession } from "../utils";
import { ACCESS_SESSION_COOKIE_NAME, maxAge } from "./constants";

const prod = () =>
    createRedisSession({
        redisPrefix: `${ACCESS_SESSION_COOKIE_NAME}:`,
        sessionName: ACCESS_SESSION_COOKIE_NAME,
        secret: process.env.SESSION_SECRET as string,
        maxAge, // 1 hour
        cookiePath: "/",
    });
// TODO replace this with the redis session above ^ after testing
const test = () =>
    createSession({
        sessionName: ACCESS_SESSION_COOKIE_NAME,
        secret: process.env.SESSION_SECRET as string,
        maxAge,
        cookiePath: "/",
    });

// For some reason, this singleton pattern is ABSOLUTELY NECESSARY
//
// Without it, the access session works when '/refresh' and '/login' import it but
// when 'gqlServer' imports, it does not work
//
// MAYBE each import creates a new access session... and only the first, initial created session has the provided cookie key...
//  and subsequent sessions either change the provided cookie key or ...
let access: any;
export default async () => {
    if (access === undefined)
        access = process.env.NODE_ENV === "prod" ? await prod() : test();

    return access;
};
