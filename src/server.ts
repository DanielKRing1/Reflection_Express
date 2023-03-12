// EXPRESS
import express, { Express } from "express";

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

// ROUTER
app.use(genRouter());

// START SERVER
app.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
