import { Router } from "express";

import createUser from "../../controllers/Auth/createUser";
import login from "../../controllers/Auth/login";

export default (): Router => {
  const router: Router = Router({ mergeParams: true });

  router.route("/create-user").post(createUser);
  router.route("/login").post(login);

  return router;
};
