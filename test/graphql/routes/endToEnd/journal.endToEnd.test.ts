import http from "http";
import supertest from "supertest";

import server from "../../../../src/index";
import prisma from "../../../../src/prisma/client";

const USER_ID1 = "1";
const USER_ID2 = "2";
const PASSWORD1 = "123";
const PASSWORD2 = "456";
const JOURNAL_NAME1 = "Journal1";
const JOURNAL_NAME2 = "Journal2";
const JOURNAL_NAME3 = "Journal3";
const JOURNAL_NAME4 = "Journal4";
const JOURNAL_NAME5 = "Journal5";

describe("Journal GraphQL server", () => {
    let s: http.Server;
    let agent: supertest.SuperAgentTest;

    beforeAll(async () => {
        // Clear Database
        await prisma.$queryRaw`TRUNCATE TABLE "User" CASCADE;`;
        await prisma.$queryRaw`ALTER SEQUENCE "Journal_id_seq" RESTART WITH 1;`;

        // Create agent
        s = await server;
        agent = supertest.agent(s);

        // Create User/ Login
        await agent
            .post("/login/create-user")
            .send({ userId: USER_ID1, password: PASSWORD1 });
    });

    it("Should get no Journals (since none have been made yet)", async () => {
        const queryData = {
            query: `query Journals {
                journals {
                    id
                    userId
                    name
                }
            }`,
            variables: {},
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(res.text).toMatchSnapshot();
    });

    it("Should create Journal 1", async () => {
        const queryData = {
            query: `mutation CreateJournal($journalName: String!) {
                createJournal(journalName: $journalName)
              }`,
            variables: { journalName: JOURNAL_NAME1 },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(res.text).toMatchSnapshot();
    });

    it("Should get Journal 1", async () => {
        const queryData = {
            query: `query Journals {
                journals {
                    id
                    userId
                    name
                }
            }`,
            variables: {},
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(res.text).toMatchSnapshot();
    });

    it("Should create Journal 2 and 3", async () => {
        const queryData = {
            query: `mutation CreateJournal($journalName2: String!, $journalName3: String!) {
                create2: createJournal(journalName: $journalName2)
                create3: createJournal(journalName: $journalName3)
              }`,
            variables: {
                journalName2: JOURNAL_NAME2,
                journalName3: JOURNAL_NAME3,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(res.text).toMatchSnapshot();
    });

    it("Should get Journal 1, 2, and 3", async () => {
        const queryData = {
            query: `query Journals {
                journals {
                    id
                    userId
                    name
                }
            }`,
            variables: {},
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(res.text).toMatchSnapshot();
    });

    it("Should log in as another user", async () => {
        // "Logout"
        agent = supertest.agent(s);

        // Create new User/ Login
        await agent
            .post("/login/create-user")
            .send({ userId: USER_ID2, password: PASSWORD2 });
    });

    it("Should fail to get any Journals as User2", async () => {
        const queryData = {
            query: `query Journals {
                journals {
                    id
                    userId
                    name
                }
            }`,
            variables: {},
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(res.text).toMatchSnapshot();
    });

    it("Should create Journal 4 and 5", async () => {
        const queryData = {
            query: `mutation CreateJournal($journalName4: String!, $journalName5: String!) {
                create4: createJournal(journalName: $journalName4)
                create5: createJournal(journalName: $journalName5)
              }`,
            variables: {
                journalName4: JOURNAL_NAME4,
                journalName5: JOURNAL_NAME5,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(res.text).toMatchSnapshot();
    });

    it("Should get Journal 4 and 5", async () => {
        const queryData = {
            query: `query Journals {
                journals {
                    id
                    userId
                    name
                }
            }`,
            variables: {},
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(res.text).toMatchSnapshot();
    });

    afterAll(async () => {
        await prisma.$queryRaw`TRUNCATE TABLE "User" CASCADE;`;
        await prisma.$queryRaw`ALTER SEQUENCE "Journal_id_seq" RESTART WITH 1;`;

        await prisma.$disconnect();
        await s.close();
    });
});
