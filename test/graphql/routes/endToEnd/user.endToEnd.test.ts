import http from "http";
import supertest from "supertest";

import setCookie from "set-cookie-parser";

import server from "../../../../src/index";
import prisma from "../../../../src/prisma/client";
import {
    ACCESS_SESSION_COOKIE_NAME,
    META_ACCESS_SESSION_COOKIE_NAME,
} from "../../../../src/middlewares/session/access/constants";
import {
    REFRESH_SESSION_COOKIE_NAME,
    META_REFRESH_SESSION_COOKIE_NAME,
} from "../../../../src/middlewares/session/refresh/constants";

const USER_ID = "1";
const PASSWORD = "123";

describe("User GraphQL server", () => {
    let s: http.Server;
    let agent: supertest.SuperAgentTest;

    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE TABLE "User" CASCADE;`;

        s = await server;
        agent = supertest.agent(s);
    });

    it("Should get access and refresh session cookies (at least 2 cookies)", async () => {
        const res = await agent
            .post("/login/create-user")
            .send({ userId: USER_ID, password: PASSWORD });

        const cookies = setCookie
            .parse(res as any)
            .sort((a, b) => a.name.localeCompare(b.name));
        console.log(cookies);
        expect(cookies.length).toBe(4);

        expect(cookies[0].name).toBe(ACCESS_SESSION_COOKIE_NAME);
        expect(cookies[1].name).toBe(META_ACCESS_SESSION_COOKIE_NAME);
        expect(cookies[2].name).toBe(REFRESH_SESSION_COOKIE_NAME);
        expect(cookies[3].name).toBe(META_REFRESH_SESSION_COOKIE_NAME);
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

        const res = await agent.post("/graphql").send(queryData);

        expect(res.text).toMatchSnapshot();
    });

    it("Should fail to get the created User without an access cookie", async () => {
        // Reset agent (and cookies)
        agent = supertest.agent(s);

        // Perform test
        const queryData = {
            query: `query User {
                user {
                    email
                    lastUsedJId
                }
            }`,
            variables: { email: USER_ID },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(res.text).toMatchSnapshot();
    });

    it("Should login and then get the created User", async () => {
        await agent
            .post("/login")
            .send({ userId: USER_ID, password: PASSWORD });

        // Perform test
        const queryData = {
            query: `query User {
                user {
                    email
                    lastUsedJId
                }
            }`,
            variables: { email: USER_ID },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(res.text).toMatchSnapshot();
    });

    it("Should fail login with wrong password and then fail to get the created User without an access cookie", async () => {
        // Reset agent (and cookies)
        agent = supertest.agent(s);

        // Unauthenticated login
        await agent
            .post("/login")
            .send({ userId: USER_ID, password: "wrong password" });

        // Perform test
        const queryData = {
            query: `query User {
                user {
                    email
                    lastUsedJId
                }
            }`,
            variables: { email: USER_ID },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(res.text).toMatchSnapshot();
    });

    it("Should fail login with wrong userId and then fail to get the created User without an access cookie", async () => {
        // Reset agent (and cookies)
        agent = supertest.agent(s);

        // Unauthenticated login
        await agent
            .post("/login")
            .send({ userId: "wrong userId", password: PASSWORD });

        // Perform test
        const queryData = {
            query: `query User {
                user {
                    email
                    lastUsedJId
                }
            }`,
            variables: { email: USER_ID },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(res.text).toMatchSnapshot();
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE TABLE "User" CASCADE;`;

        await prisma.$disconnect();
        await s.close();
    });
});
