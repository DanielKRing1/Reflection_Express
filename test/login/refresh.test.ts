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
import { CookieOptions } from "express";
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
        // console.log(
        //     agent.jar.getCookies({
        //         path: "/",
        //         domain: COOKIE_DOMAIN,
        //         secure: false,
        //         script: false,
        //     })
        // );
        expect(
            agent.jar
                .getCookies({
                    path: "/",
                    domain: COOKIE_DOMAIN,
                    secure: false,
                    script: false,
                })
                .filter((c: CookieOptions) => c.path === "/").length
        ).toBe(3);

        // console.log(
        //     agent.jar.getCookies({
        //         path: "/refresh",
        //         domain: COOKIE_DOMAIN,
        //         secure: false,
        //         script: false,
        //     })
        // );

        expect(
            agent.jar
                .getCookies({
                    path: "/refresh",
                    domain: COOKIE_DOMAIN,
                    secure: false,
                    script: false,
                })
                .filter((c: CookieOptions) => c.path === "/refresh").length
        ).toBe(1);

        expect(cookies[0].name).toBe(ACCESS_SESSION_COOKIE_NAME);
        expect(cookies[1].name).toBe(META_ACCESS_SESSION_COOKIE_NAME);
        expect(cookies[2].name).toBe(REFRESH_SESSION_COOKIE_NAME);
        expect(cookies[3].name).toBe(META_REFRESH_SESSION_COOKIE_NAME);
    });

    it("Should refresh, even with access cookies", async () => {
        let res;
        let cookies;

        // console.log(
        //     agent.jar.getCookies({
        //         path: "/refresh",
        //         domain: COOKIE_DOMAIN,
        //         secure: false,
        //         script: false,
        //     })
        // );

        res = await agent.post("/refresh").send();
        cookies = setCookie
            .parse(res as any)
            .sort((a, b) => a.name.localeCompare(b.name));
        // console.log(cookies);

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
        // expect(cookies.length).toBe(4);
        expect(
            agent.jar
                .getCookies({
                    path: "/",
                    domain: COOKIE_DOMAIN,
                    secure: false,
                    script: false,
                })
                .filter((c: CookieOptions) => c.path === "/").length
        ).toBe(3);

        expect(
            agent.jar
                .getCookies({
                    path: "/refresh",
                    domain: COOKIE_DOMAIN,
                    secure: false,
                    script: false,
                })
                .filter((c: CookieOptions) => c.path === "/refresh").length
        ).toBe(1);

        // console.log(
        //     agent.jar.getCookies({
        //         path: "/",
        //         domain: COOKIE_DOMAIN,
        //         secure: false,
        //         script: false,
        //     })
        // );
    });

    // it("Should refresh without access cookies and fetch new access cookies", async () => {
    //     let res;
    //     let cookies;

    //     // Remove access cookies
    //     agent.jar.setCookie(
    //         `${ACCESS_SESSION_COOKIE_NAME}=; expires=Thu, 01 Jan 2000 12:00:00 UTC; path=/; domain=${COOKIE_DOMAIN}`
    //     );
    //     agent.jar.setCookie(
    //         `${META_ACCESS_SESSION_COOKIE_NAME}=; expires=Thu, 01 Jan 2000 12:00:00 UTC; path=/; domain=${COOKIE_DOMAIN}`
    //     );

    //     console.log(
    //         agent.jar.getCookies({
    //             path: "/",
    //             domain: ".",
    //             secure: false,
    //             script: false,
    //         })
    //     );

    //     res = await agent.post("/refresh").withCredentials(true).send();
    //     cookies = setCookie
    //         .parse(res as any)
    //         .sort((a, b) => a.name.localeCompare(b.name));
    //     console.log(cookies);

    //     console.log(
    //         agent.jar.getCookies({
    //             path: "/",
    //             domain: COOKIE_DOMAIN,
    //             secure: false,
    //             script: false,
    //         })
    //     );
    //     console.log(
    //         agent.jar.getCookies({
    //             path: "/refresh",
    //             domain: COOKIE_DOMAIN,
    //             secure: false,
    //             script: false,
    //         })
    //     );

    //     expect(
    //         agent.jar
    //             .getCookies({
    //                 path: "/",
    //                 domain: COOKIE_DOMAIN,
    //                 secure: false,
    //                 script: false,
    //             })
    //             .filter((c: CookieOptions) => c.path === "/").length
    //     ).toBe(3);

    //     expect(
    //         agent.jar
    //             .getCookies({
    //                 path: "/refresh",
    //                 domain: COOKIE_DOMAIN,
    //                 secure: false,
    //                 script: false,
    //             })
    //             .filter((c: CookieOptions) => c.path === "/refresh").length
    //     ).toBe(1);
    // });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE TABLE "User" CASCADE;`;

        await prisma.$disconnect();
        await s.close();
    });
});
