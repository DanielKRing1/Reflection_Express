import { MiddlewareFunc } from "../types";

/**
 * This middleware generator returns the provided express-session
 *
 * This may be redundant.
 * My thought is that by creating this middleware generator,
 *  sessions will not be directly added as middleware,
 *  and instead, it will be more clear that sessions can simply be added but that they may also need to be 'authorized'
 */
export default (sessionMiddleware: MiddlewareFunc): MiddlewareFunc =>
  sessionMiddleware;
