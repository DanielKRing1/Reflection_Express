import http from "http";
import supertest from "supertest";

import setCookie from "set-cookie-parser";

import server from "../../src/index";
import prisma from "../../src/prisma/client";
import {
    ACCESS_SESSION_COOKIE_NAME,
    META_ACCESS_SESSION_COOKIE_NAME,
} from "../../src/middlewares/session/access/constants";
import {
    REFRESH_SESSION_COOKIE_NAME,
    META_REFRESH_SESSION_COOKIE_NAME,
} from "../../src/middlewares/session/refresh/constants";
import { COOKIE_DOMAIN } from "../../src/utils/cookies";
import { useFakeTimer } from "../../jest/utils/time";

const USER_ID = "1";
const PASSWORD = "123";

const PRESENT_DATE = new Date(2023, 3, 16);

describe("User GraphQL server", () => {
    let s: http.Server;
    let agent: supertest.SuperAgentTest;

    beforeAll(async () => {
        console.log("start beforeAll");
        // Mock Date constructor
        console.log("going beforeAll");

        await prisma.$queryRaw`TRUNCATE TABLE "User" CASCADE;`;
        console.log("after query beforeAll");

        s = await server;
        console.log("after start server beforeAll");
        agent = supertest.agent(s);

        useFakeTimer(PRESENT_DATE);
    });

    it("Should get access and refresh session cookies (at least 2 cookies)", async () => {
        console.log("start test1");
        const res = await agent
            .post("/login/create-user")
            .send({ userId: USER_ID, password: PASSWORD });
        console.log("going test1");

        const cookies = setCookie
            .parse(res as any)
            .sort((a, b) => a.name.localeCompare(b.name));
        console.log(cookies);
        expect(cookies.length).toBe(4);

        expect(cookies[0].name).toBe(ACCESS_SESSION_COOKIE_NAME);
        expect(cookies[1].name).toBe(META_ACCESS_SESSION_COOKIE_NAME);
        expect(cookies[2].name).toBe(REFRESH_SESSION_COOKIE_NAME);
        expect(cookies[3].name).toBe(META_REFRESH_SESSION_COOKIE_NAME);

        console.log(
            agent.jar.getCookies({
                domain: COOKIE_DOMAIN,
                path: "/refresh",
                secure: false,
                script: false,
            })
        );
    });

    it("Should get the created User (this requires successfully sending an access session cookie with the request)", async () => {
        const queryData = {
            query: `query User {
                user {
                    email
                    lastUsedJId
                }
            }`,
            variables: { email: USER_ID },
        };

        console.log("start test2");
        const res = await agent.post("/graphql").send(queryData);
        console.log("going test2");

        expect(res.text).toMatchSnapshot();
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE TABLE "User" CASCADE;`;

        await prisma.$disconnect();
        await s.close();
    });
});
