import { createSession, createRedisSession } from "../utils";

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
  sessionName: "rfltn-access",
  secret: process.env.SESSION_SECRET as string,
  maxAge,
  cookiePath: "/",
});
