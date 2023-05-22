import { NextFunction, Request, Response, Router } from "express";
import { Password } from "@prisma/client";
import axios from "axios";

import signJwt from "../../auth/jwt/sign.jwt";
import compare from "../../auth/password/compare";

import verifyJwtMiddleware from "../../middlewares/jwt/verifyJwt.middleware";
import access from "../../middlewares/session/access";
import {
    maxAge as accessMaxAge,
    META_ACCESS_SESSION_COOKIE_NAME,
} from "../../middlewares/session/access/constants";
import {
    destroySession,
    SessionCookieType,
} from "../../middlewares/session/utils";
import { Dict } from "../../types/global.types";
import { HttpCookieResponse, mergeCookies } from "../../utils/cookies";
import prisma from "../../prisma/client";
import hashAndSalt from "../../auth/password/hash";
import refresh from "../../middlewares/session/refresh";
import { COOKIE_ARGS_LAX } from "../../middlewares/session/constants";

export default (): Router => {
    const router: Router = Router({ mergeParams: true });

    router.route("/create-user").post(createUserController, loginController);
    router.route("/").post(loginController);
    router.route("/logout").post(logoutController);
    router.route("/get-access").post(getAccessController);

    return router;
};

const createUserController = async function (
    req: Request<{}, {}, LoginBody>,
    res: Response,
    next: NextFunction
) {
    try {
        let { userId, password } = req.body;

        // 1. User credentials not provided
        if (userId === undefined || password === undefined)
            throw new Error(
                "/create-user received an undefined userId or password"
            );

        // 2. Check if user already exists
        const userAlreadyExists: boolean =
            (await prisma.user.findUnique({
                where: {
                    email: userId,
                },
            })) !== null;
        if (userAlreadyExists)
            throw new Error(
                `createUser() received an invalid request to create a user that already exists "${userId}"`
            );

        // 3. Hash password
        const hash: string = await hashAndSalt(password);

        // 4. Create user in database if not exists
        const createStatus = await prisma.user.create({
            data: {
                email: userId,
                password_userId: {
                    create: {
                        hash: hash,
                    },
                },
            },
        });

        // 3. Login and get access and refresh tokens
        next();
    } catch (err) {
        console.log(err);
        return res.status(409).send("Failed to create user");
    }
};

type LoginBody = {
    userId: string;
    password: string;
};
const loginController = [
    access,
    async function (req: Request<{}, {}, LoginBody>, res: Response) {
        try {
            console.log("/login---------------------------");

            // 1. Get user credentials
            const { userId, password } = req.body;

            // 2. Get User's password hash from db
            const passwordRow: Password =
                await prisma.password.findUniqueOrThrow({
                    where: {
                        userId,
                    },
                });

            // 3. Validate user credentials
            const isValid = await compare(password, passwordRow.hash);
            // 4. Invalid, destroy session and return error code
            if (!isValid) {
                throw new Error(
                    "/login controller determined that the provided user credentials are invalid"
                );
            }

            // 5. Create access session (and cookie)
            addAccessCookies(userId, req, res);

            // 6. Valid, get refresh cookie
            // 6.1. Create jwt
            const payload: Dict<any> = {
                userId,
            };
            const jwt: string = await signJwt(
                payload,
                process.env.JWT_SECRET!,
                {
                    expiresIn: 10, // Expires in 10 secs
                }
            );
            // 6.2. Send jwt to '/refresh/get-refresh'
            const responseWCookie = await axios.post(
                // TODO Put this in config file
                `http://localhost:4000/refresh/get-refresh`,
                { jwt }
            );

            // 7. Add refresh cookie to res.cookie
            mergeCookies(responseWCookie as HttpCookieResponse, res);

            res.send("Success");
        } catch (err) {
            console.log(err);
            // 1. Destroy session on error and clear access session cookies from browser
            await destroySession(req, res, SessionCookieType.Access);

            return res.status(401).send("Unauthenticated");
        }
    },
];

const logoutController = [
    access,
    async function (req: Request<{}, {}, {}>, res: Response) {
        try {
            console.log("access/logout---------------------------");

            // 1. Destroy session and clear access session cookies from browser
            await destroySession(req, res, SessionCookieType.Access);

            return res.send("Success");
        } catch (err) {
            console.log(err);
            return res.status(401).send("Unauthenticated");
        }
    },
];

type RefreshGetAccessBody = { jwt: string };
const getAccessController = [
    verifyJwtMiddleware,
    access,
    async function (req: Request<{}, {}, RefreshGetAccessBody>, res: Response) {
        try {
            console.log("/login/get-access---------------------------");

            // 1. Get jwt
            const jwtPayload = req.jwtPayload as Dict<any>;

            // 2. Verify jwt
            const { userId } = jwtPayload;

            // 3. Add userId to refresh session
            addAccessCookies(userId, req, res);

            return res.send("Look for cookie");
        } catch (err) {
            console.log(err);
            // 1. Destroy session on error and clear access session cookies from browser
            await destroySession(req, res, SessionCookieType.Access);

            return res.status(401).send("Unauthenticated");
        }
    },
];

const addAccessCookies = (userId: string, req: Request, res: Response) => {
    // 1. Add non http-only 'meta' cookie (so client can check maxAge, etc...)
    createMetaCookie(res);

    // 2. Add access cookie
    req.session.userId = userId;
};

/**
 * Adds a cookie with 'expires' meta data to the Express Response object
 *
 * @param res Express Response object
 */
const createMetaCookie = (res: Response) => {
    // 1. Add non http-only 'meta' cookie (so client can check maxAge, etc...)
    res.cookie(
        META_ACCESS_SESSION_COOKIE_NAME,
        JSON.stringify({ expires: new Date(Date.now() + accessMaxAge) }),
        {
            maxAge: accessMaxAge,
            ...COOKIE_ARGS_LAX,
        }
    ); // options is optional
};
