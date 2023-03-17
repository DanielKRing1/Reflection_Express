// EXPRESS
import express, { Express } from "express";
import cors from "cors";

// MIDDLEWARE
import loggingMiddleware from "./middlewares/logging.middleware";

// GRAPHQL
import gqlServer from "./gqlServer";

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

// Start GraphQL Server
gqlServer(app);
