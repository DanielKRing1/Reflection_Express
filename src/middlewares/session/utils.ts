import session from "express-session";
import { createClient } from "redis";
import RedisStore from "connect-redis";

type CreateRedisSession = {
  redisPrefix: string;
} & Omit<CreateSession<RedisStore>, "sessionStore">;
/**
 * Create express-session with Redis store
 *
 * @param param0
 * @returns
 */
export const createRedisSession = ({
  redisPrefix,
  sessionName,
  secret,
  maxAge,
  cookiePath,
}: CreateRedisSession) => {
  const redisStore: RedisStore = createRedisStore(redisPrefix);
  return createSession({
    sessionName,
    sessionStore: redisStore,
    secret,
    maxAge,
    cookiePath,
  });
};

/**
 * Connect to Redis store
 *
 * @param prefix
 * @returns
 */
const createRedisStore = (prefix: string): RedisStore => {
  let redisClient = createClient();
  redisClient.connect().catch(console.error);

  return new RedisStore({
    client: redisClient,
    prefix,
  });
};

type CreateSession<T> = {
  sessionName: string;
  sessionStore?: T;
  secret: string;
  maxAge: number;
  cookiePath: string;
};
/**
 * Create express-session
 *
 * @param param0
 * @returns
 */
export const createSession = ({
  sessionName,
  sessionStore,
  secret,
  maxAge,
  cookiePath,
}: CreateSession<any>) => {
  return session({
    secret,
    store: sessionStore,
    name: sessionName,
    resave: false, // Do not re-submit 'set' action to store when 'session' obj has not been modified
    saveUninitialized: false, // Do not 'create' session in store when 'session' obj has not been modified
    cookie: {
      path: cookiePath,
      // secure: true, // if true only transmit cookie over https
      httpOnly: true, // if true prevent client side JS from reading the cookie
      maxAge,
    },
  });
};
