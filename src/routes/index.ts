import { Router } from "express";

import genInklingRouter from "./Inkling";
import genReflectionRouter from "./Reflection";
import genJournalRouter from "./Journal";
import genJournalEntryRouter from "./JournalEntry";

export default (): Router => {
  const router: Router = Router();

  router.use("/inkling", genInklingRouter());
  router.use("/reflection", genReflectionRouter());
  router.use("/journal", genJournalRouter());
  router.use("/journalEntry", genJournalEntryRouter());

  return router;
};
