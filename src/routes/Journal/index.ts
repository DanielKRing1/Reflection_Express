import { Router } from "express";

import addJournal from "../../controllers/Journal/addJournal";
import getJournal from "../../controllers/Journal/getJournal";

export default (): Router => {
  const router: Router = Router({ mergeParams: true });

  router.route("/get").get(getJournal);
  router.route("/add").post(addJournal);

  return router;
};
