// EXPRESS
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import configureDotEnv from "../env";
configureDotEnv();

// MIDDLEWARE
import loggingMiddleware from "./middlewares/logging.middleware";
import authorizeMiddleware from "./middlewares/session/genAuthorizeSession.middleware";

// ROUTER
import genLoginRouter from "./routes/Login";
import genRefreshRouter from "./routes/Refresh";
import { GQL_PATH } from "./graphql/constants";

// APP
const app: Express = express();

// MIDDLEWARE
app.use(
    cors({
        // NECESSARY TO SAVE COOKIES TO BROWSER
        origin: process.env.CORS_ORIGIN,
        // origin: "http://localhost:3000",
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
app.use("/login", genLoginRouter());
app.use("/refresh", genRefreshRouter());
// Auth middleware
// app.use(GQL_PATH, authorizeMiddleware);
// All else
// app.use("/", routes);

export default app;
