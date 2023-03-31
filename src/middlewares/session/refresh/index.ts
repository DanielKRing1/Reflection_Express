import { createSession, createRedisSession } from "../utils";

// export default createRedisSession({
//   redisPrefix: "rfltn-refresh:",
//   sessionName: "rfltn-refresh",
//   secret: process.env.SESSION_SECRET as string,
//   maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
//   // TODO Put in config file to use to also defined refresh route
//   cookiePath: "/refresh",
// });
// TODO replace this with the redis session above ^ after testing
export default createSession({
  sessionName: "rfltn-refresh",
  secret: process.env.SESSION_SECRET as string,
  maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  // TODO Put in config file to use to also defined refresh route
  cookiePath: "/refresh",
});
