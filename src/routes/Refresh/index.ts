import { Request, Response, Router } from "express";
import axios from "axios";

import refresh from "../../middlewares/session/refresh";

export default (): Router => {
  const router: Router = Router({ mergeParams: true });

  router.route("/").post(refresh, async function (req: Request, res: Response) {
    // @ts-ignore
    console.log(req.session.userId);
    // @ts-ignore
    req.session.userId = "test1";
    // @ts-ignore
    console.log(req.session.userId);

    res.redirect("/refresh/get-access");
  });
  router.route("/get-access").post(
    refresh,
    async function (req: Request, res: Response) {},
    function (req: Request, res: Response) {
      // @ts-ignore
      console.log(req.session.userId);
      // @ts-ignore
      req.session.userId = "test2";

      // @ts-ignore
      console.log(req.session.userId);

      res.send("good");
    }
  );

  return router;
};
