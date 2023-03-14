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
app.use(cors());
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(loggingMiddleware);

// GRAPHQL
app.use(genRouter());

// START SERVER
app.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
