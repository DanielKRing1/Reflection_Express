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
        // console.log(cookies);
        expect(cookies.length).toBe(4);

        expect(cookies[0].name).toBe(ACCESS_SESSION_COOKIE_NAME);
        expect(cookies[1].name).toBe(META_ACCESS_SESSION_COOKIE_NAME);
        expect(cookies[2].name).toBe(REFRESH_SESSION_COOKIE_NAME);
        expect(cookies[3].name).toBe(META_REFRESH_SESSION_COOKIE_NAME);
    });

    it("Should logout", async () => {
        let res;
        let cookies;

        // console.log(
        //     agent.jar.getCookies({
        //         path: "/",
        //         domain: COOKIE_DOMAIN,
        //         secure: false,
        //         script: false,
        //     })
        // );

        res = await agent.post("/login/logout").send();
        cookies = setCookie
            .parse(res as any)
            .sort((a, b) => a.name.localeCompare(b.name));
        // console.log(cookies);
        // expect(cookies.length).toBe(4);
        // console.log(
        //     agent.jar.getCookies({
        //         path: "/",
        //         domain: COOKIE_DOMAIN,
        //         secure: false,
        //         script: false,
        //     })
        // );
        // console.log(
        //     agent.jar.getCookies({
        //         path: "/refresh",
        //         domain: COOKIE_DOMAIN,
        //         secure: false,
        //         script: false,
        //     })
        // );
        expect(
            agent.jar.getCookies({
                path: "/",
                domain: COOKIE_DOMAIN,
                secure: false,
                script: false,
            }).length
        ).toBe(0);

        // console.log(
        //     agent.jar.getCookies({
        //         path: "/refresh",
        //         domain: COOKIE_DOMAIN,
        //         secure: false,
        //         script: false,
        //     })
        // );
        expect(
            agent.jar.getCookies({
                path: "/refresh",
                domain: COOKIE_DOMAIN,
                secure: false,
                script: false,
            }).length
        ).toBe(0);
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE TABLE "User" CASCADE;`;

        await prisma.$disconnect();
        await s.close();
    });
});
