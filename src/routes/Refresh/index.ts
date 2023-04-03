import { Request, Response, Router } from "express";
import axios from "axios";

import refresh, { maxAge } from "../../middlewares/session/refresh";
import verifyJwtMiddleware from "../../middlewares/jwt/verifyJwt.middleware";
import { Dict } from "../../types/global.types";
import { destroySession } from "../../middlewares/session/utils";
import signJwt from "../../auth/jwt/sign.jwt";
import { mergeCookies, HttpCookieResponse } from "../../utils/cookies";

export default (): Router => {
  const router: Router = Router({ mergeParams: true });

  router.route("/").post(refreshController);

  router.route("/get-refresh").post(getRefreshController);

  return router;
};

type LoginGetRefreshBody = {
  jwt: string;
};
const refreshController = [
  refresh,
  async function (req: Request<{}, {}, {}>, res: Response) {
    try {
      // 1. Check if has session
      const { userId } = req.session;
      if (userId === undefined)
        throw new Error("/refresh received no session.userId");

      // 2. Regenerate session if > half expired
      console.log(
        `Refresh cookie expires at: ${req.session?.cookie?.expires!}`
      );
      if (Date.now() - req.session?.cookie?.expires!.getTime() > maxAge / 2) {
        await new Promise((reject, resolve) =>
          req.session.regenerate((err) => {
            if (err) return reject(err);
            return resolve();
          })
        );
      }

      // 3. Get new access token
      // 3.1. Create jwt
      const payload: Dict<any> = {
        userId,
      };
      const jwt: string = await signJwt(payload, process.env.JWT_SECRET!, {
        expiresIn: 10, // Expires in 10 secs
      });
      // 3.2. Send jwt to '/login/get-access'
      const responseWCookie = await axios.post(
        // TODO Put this in config file
        `http://localhost:4000/login/get-access`,
        { jwt }
      );

      // 4. Add refresh cookie to res.cookie
      mergeCookies(responseWCookie as HttpCookieResponse, res);

      res.send("Success");
    } catch (err) {
      console.log(err);
      // Destroy session on error
      await destroySession(req);
      return res.status(401).send("Unauthenticated");
    }
  },
];

const getRefreshController = [
  verifyJwtMiddleware,
  refresh,
  async function (req: Request<{}, {}, LoginGetRefreshBody>, res: Response) {
    try {
      console.log("/refresh/get-refresh---------------------------");

      // 1. Get jwt
      const jwtPayload = req.jwtPayload as Dict<any>;

      // 2. Verify jwt
      const { userId } = jwtPayload;

      // 3. Add userId to access session
      req.session.userId = userId;

      return res.send("Look for cookie");
    } catch (err) {
      console.log(err);
      await destroySession(req);
      return res.status(401).send("Unauthenticated");
    }
  },
];
