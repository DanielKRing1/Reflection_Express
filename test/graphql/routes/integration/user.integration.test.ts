import http from "http";
import supertest from "supertest";

import { ApolloServer } from "@apollo/server";

import server from "../../../../src/index";
import typeDefs from "../../../../src/graphql/schema";
import resolvers from "../../../../src/graphql/resolvers";
import GqlContext from "../../../../src/graphql/types/context.types";
import prisma from "../../../../src/prisma/client";

const USER_ID = "1";
const PASSWORD = "123";

const gqlServer = new ApolloServer<GqlContext>({
    typeDefs,
    resolvers,
});

describe("User GraphQL api", () => {
    let s: http.Server;
    let request: supertest.SuperTest<supertest.Test>;

    beforeAll(async () => {
        await prisma.$queryRaw`TRUNCATE TABLE "User" CASCADE;`;

        // TEST EXPRESS SESSION ROUTES
        s = await server;
        request = supertest(s);

        await request
            .post("/login/create-user")
            .send({ userId: USER_ID, password: PASSWORD });
    });

    it("Should get the created User", async () => {
        // run the query against the server and snapshot the output
        const res = await gqlServer.executeOperation(
            {
                query: `query User {
                    user {
                        email
                        lastUsedJId
                    }
                }`,
                variables: {},
            },
            {
                contextValue: {
                    // @ts-ignore
                    req: { session: { userId: USER_ID } } as unknown as Request,
                    // @ts-ignore
                    res: {},
                },
            }
        );

        // console.log(res);
        // // @ts-ignore
        // console.log(res.body.singleResult.data);
        // console.log(JSON.stringify(res.body));

        expect(res).toMatchSnapshot();
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE TABLE "User" CASCADE;`;

        await prisma.$disconnect();

        await s.close();
    });
});
