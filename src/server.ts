// EXPRESS
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
console.log(process.env); // remove this after you've confirmed it is working

// SERVER
import gqlServer from "./gqlServer";

// SESSION
import accessSession from "./middlewares/session/access";
import refreshSession from "./middlewares/session/refresh";

// MIDDLEWARE
import loggingMiddleware from "./middlewares/logging.middleware";
import authorizeMiddleware from "./middlewares/session/genAuthorizeSession.middleware";

// ROUTER
import genLoginRouter from "./routes/Login";
import genRefreshRouter from "./routes/Refresh";

// APP
const app: Express = express();

// MIDDLEWARE
app.use(
  cors({
    // origin: "https://reflection.fly.dev/",
    credentials: true, // <-- REQUIRED backend setting
  })
);
// parse cookies - add to req.cookies
app.use(cookieParser());
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(loggingMiddleware);
// // Auth routes
app.use("/login", accessSession, genLoginRouter());
app.use("/refresh", refreshSession, genRefreshRouter());
// Auth middleware
app.use(authorizeMiddleware);
// // All else
// app.use("/", routes);

// GRAPHQL
// Start GraphQL Server
gqlServer(app, accessSession);
