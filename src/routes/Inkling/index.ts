import { Router } from "express";

import getInkling from "../../controllers/Inkling/getInkling";
import addInkling from "../../controllers/Inkling/addInkling";
import rmInkling from "../../controllers/Inkling/rmInkling";
import clearInkling from "../../controllers/Inkling/clearInkling";

export default (): Router => {
  const router: Router = Router({ mergeParams: true });

  router.route("/get").get(getInkling);
  router.route("/add").post(addInkling);
  router.route("/rm").post(rmInkling);
  router.route("/clear").post(clearInkling);

  return router;
};
