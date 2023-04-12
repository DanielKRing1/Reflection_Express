import supertest from "supertest";

import { ApolloServer } from "@apollo/server";

import app from "../../../../src/server";
import typeDefs from "../../../../src/graphql/schema";
import resolvers from "../../../../src/graphql/resolvers";
import GqlContext from "../../../../src/graphql/types/context.types";
import prisma from "../../../../src/prisma/client";

const USER_ID = "1";
const PASSWORD = "123";

describe("User api", () => {
    beforeAll(async () => {
        console.log(
            `TRUNCATE TABLE ${process.env.DATABASE_SCHEMA}."User" CASCADE;`
        );
        await prisma.$queryRaw`TRUNCATE TABLE "User" CASCADE;`;

        // TEST EXPRESS SESSION ROUTES
        await supertest(app)
            .post("/login/create-user")
            .send({ userId: USER_ID, password: PASSWORD });

        console.log("1");
        // await supertest(app).post("/login/refresh");
    });

    it("Should get the created User", async () => {
        console.log("2");
        // // TEST EXPRESS SESSION ROUTES
        // supertest(app).post("/login/create-user");
        // supertest(app).post("/login/refresh");

        // TEST GRAPHQL
        const gqlServer = new ApolloServer<GqlContext>({
            typeDefs,
            resolvers,
        });

        // run the query against the server and snapshot the output
        const res = await gqlServer.executeOperation(
            {
                query: `query User($email: String!) {
                    user(email: $email) {
                        email
                        lastUsedJId
                    }
                }`,
                variables: { email: USER_ID },
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

        console.log(res);
        // @ts-ignore
        console.log(res.body.singleResult.data);
        console.log(JSON.stringify(res.body));

        // Note the use of Node's assert rather than Jest's expect; if using
        // TypeScript, `assert`` will appropriately narrow the type of `body`
        // and `expect` will not.
        // assert(response.body.kind === 'single');
        // expect(response.body.singleResult.errors).toBeUndefined();
        // expect(response.body.singleResult.data?.hello).toBe('Hello

        //   expect(res).toMatchSnapshot();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });
});
