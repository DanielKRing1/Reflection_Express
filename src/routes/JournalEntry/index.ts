import { Router } from "express";

import addEntry from "../../controllers/JournalEntry/addEntry";

export default (): Router => {
  const router: Router = Router({ mergeParams: true });

  router.route("/add").post(addEntry);

  return router;
};
