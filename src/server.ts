// EXPRESS
import express, { Express } from "express";
import cors from "cors";

// MIDDLEWARE
import loggingMiddleware from "./middlewares/logging.middleware";

// ROUTES
import genRouter from "./routes";

// CONFIG
import { PORT } from "./config/server.config";

// APP
const app: Express = express();

// MIDDLEWARE
app.use(loggingMiddleware);
app.use(cors());

// ROUTER
app.use(genRouter());

// START SERVER
app.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
