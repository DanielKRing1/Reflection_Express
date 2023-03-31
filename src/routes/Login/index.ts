import { Request, Response, Router } from "express";

import createUser from "../../controllers/Auth/createUser";
import login from "../../controllers/Auth/login";
import access from "../../middlewares/session/access";

export default (): Router => {
  const router: Router = Router({ mergeParams: true });

  type LoginBody = {
    username: string;
    password: string;
  };
  router
    .route("/create-user")
    .post(async function (req: Request<{}, {}, LoginBody>, res: Response) {
      const { username, password } = req.body;
    });
  router
    .route("/")
    .post(
      access,
      async function (req: Request<{}, {}, LoginBody>, res: Response) {}
    );
  router
    .route("/get-refresh")
    .post(access, async function (req: Request, res: Response) {});

  return router;
};
