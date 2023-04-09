import { NextFunction, Request, Response, Router } from "express";
import { Password } from "@prisma/client";
import axios from "axios";

import signJwt from "../../auth/jwt/sign.jwt";
import compare from "../../auth/password/compare";

import verifyJwtMiddleware from "../../middlewares/jwt/verifyJwt.middleware";
import access from "../../middlewares/session/access";
import { destroySession } from "../../middlewares/session/utils";
import { Dict } from "../../types/global.types";
import { HttpCookieResponse, mergeCookies } from "../../utils/cookies";
import prisma from "../../prisma/client";
import hashAndSalt from "../../auth/password/hash";

export default (): Router => {
    const router: Router = Router({ mergeParams: true });

    router.route("/create-user").post(createUserController, loginController);
    router.route("/").post(loginController);
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
            (await prisma.user.findUniqueOrThrow({
                where: {
                    email: userId,
                },
            })) !== undefined;
        if (userAlreadyExists)
            throw new Error(
                `createUser() received an invalid request to create a user that already exists ${email}`
            );

        // 3. Hash password
        const passwordHash: string = await hashAndSalt(password);

        // 4. Create user in database if not exists
        const createStatus = await prisma.user.create({
            data: {
                email: userId,
                password_userId: {
                    create: {
                        hash: passwordHash,
                    },
                },
            },
        });

        console.log(createStatus);

        // 3. Login and get access and refresh tokens
        next();
    } catch (err) {
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
            req.session.userId = userId;

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
            // Destroy session on error
            await destroySession(req);
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
            req.session.userId = userId;

            return res.send("Look for cookie");
        } catch (err) {
            console.log(err);
            await destroySession(req);
            return res.status(401).send("Unauthenticated");
        }
    },
];
