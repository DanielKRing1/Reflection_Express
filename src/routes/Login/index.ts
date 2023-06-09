import { NextFunction, Request, Response, Router } from "express";
import { Password } from "@prisma/client";

import compare from "../../auth/password/compare";

import verifyJwtMiddleware from "../../middlewares/jwt/verifyJwt.middleware";
import accessPromise from "../../middlewares/session/access";
import {
    destroySession,
    SessionCookieType,
} from "../../middlewares/session/utils";
import { Dict } from "../../types/global.types";
import prisma from "../../prisma/client";
import hashAndSalt from "../../auth/password/hash";
import {
    addAccessCookies,
    addRefreshCookies,
} from "../../utils/sessionCookies";

export default async (): Promise<Router> => {
    const access = await accessPromise();

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

                // 6. Valid, create refresh cookies
                await addRefreshCookies(userId, req, res);

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
                await destroySession(req, res, SessionCookieType.Refresh);

                return res.send("Success");
            } catch (err) {
                console.log(err);
                return res.status(401).send("Unauthenticated");
            }
        },
    ];

    // ROUTER

    const router: Router = Router({ mergeParams: true });

    router.route("/create-user").post(createUserController, loginController);
    router.route("/").post(loginController);
    router.route("/logout").post(logoutController);

    return router;
};

type LoginBody = {
    userId: string;
    password: string;
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
