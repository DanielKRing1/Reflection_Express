import { Router } from "express";

import addReflection from "../../controllers/Reflection/addReflection";

export default (): Router => {
  const router: Router = Router({ mergeParams: true });

  router.route("/add").post(addReflection);

  return router;
};
