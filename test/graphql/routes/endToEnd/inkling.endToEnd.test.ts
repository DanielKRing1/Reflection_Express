import http from "http";
import supertest from "supertest";

import server from "../../../../src/index";
import prisma from "../../../../src/prisma/client";

const USER_ID1 = "1";
const USER_ID2 = "2";
const PASSWORD1 = "123";
const PASSWORD2 = "456";
const JOURNAL_NAME1 = "1";
const JOURNAL_NAME2 = "2";
const JOURNAL_NAME3 = "3";
const USER1_JOURNAL1_INKLINGS1 = [
    "User1 Inkling1 Journal1",
    "User1 Inkling2 Journal1",
    "User1 Inkling3 Journal1",
    "User1 Inkling4 Journal1",
    "User1 Inkling5 Journal1",
];
const USER1_JOURNAL1_INKLINGS2 = [
    "User1 Inkling6 Journal1",
    "User1 Inkling7 Journal1",
    "User1 Inkling8 Journal1",
    "User1 Inkling9 Journal1",
    "User1 Inkling10 Journal1",
];
const USER1_JOURNAL2_INKLINGS1 = [
    "User1 Inkling6 Journal2",
    "User1 Inkling7 Journal2",
    "User1 Inkling3 Journal2",
    "User1 Inkling9 Journal2",
    "User1 Inkling10 Journal2",
];
const USER2_JOURNAL3_INKLINGS1 = [
    "User2 Inkling1 Journal3",
    "User2 Inkling2 Journal3",
    "User2 Inkling3 Journal3",
    "User2 Inkling4 Journal3",
    "User2 Inkling5 Journal3",
];

describe("Inkling GraphQL server", () => {
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

    it("Should fail to get any User 1 Journal 1 Inklings before they are made", async () => {
        const queryData = {
            query: `query Inklings($journalId: BigInt!) {
                inklings(journalId: $journalId) {
                    timeId
                    journalId
                    text
                }
            }`,
            variables: { journalId: JOURNAL_NAME1 },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should create User 1 Journal 1", async () => {
        const queryData = {
            query: `mutation CreateJournal($journalName: String!) {
                createJournal(journalName: $journalName) {
                    id
                    userId
                    name
                }
            }`,
            variables: {
                journalName: JOURNAL_NAME1,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should create 5 User 1 Journal 1 Inklings", async () => {
        const queryData = {
            query: `mutation CommitInklings($commitInklingsJournalId: BigInt!, $inklingTexts: [String]!) {
                commitInklings(journalId: $commitInklingsJournalId, inklingTexts: $inklingTexts) {
                    timeId
                    journalId
                    text
                }
              }`,
            variables: {
                commitInklingsJournalId: JOURNAL_NAME1,
                inklingTexts: USER1_JOURNAL1_INKLINGS1,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should get 5 User 1 Journal 1 Inklings", async () => {
        const queryData = {
            query: `query Inklings($journalId: BigInt!) {
                inklings(journalId: $journalId) {
                    timeId
                    journalId
                    text
                }
            }`,
            variables: { journalId: JOURNAL_NAME1 },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.inklings.length).toBe(5);
    });

    it("Should create 5 more User 1 Journal 1 Inklings", async () => {
        const queryData = {
            query: `mutation CommitInklings($commitInklingsJournalId: BigInt!, $inklingTexts: [String]!) {
                commitInklings(journalId: $commitInklingsJournalId, inklingTexts: $inklingTexts) {
                    timeId
                    journalId
                    text
                }
            }`,
            variables: {
                commitInklingsJournalId: JOURNAL_NAME1,
                inklingTexts: USER1_JOURNAL1_INKLINGS2,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should get 10 User 1 Journal 1 Inklings", async () => {
        const queryData = {
            query: `query Inklings($journalId: BigInt!) {
                inklings(journalId: $journalId) {
                    timeId
                    journalId
                    text
                }
            }`,
            variables: { journalId: JOURNAL_NAME1 },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.inklings.length).toBe(10);
    });

    it("Should create User 1 Journal 2", async () => {
        const queryData = {
            query: `mutation CreateJournal($journalName: String!) {
                createJournal(journalName: $journalName) {
                    id
                    userId
                    name
                }
            }`,
            variables: {
                journalName: JOURNAL_NAME2,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should get no User 1 Journal 2 Inklings (since none have been made yet)", async () => {
        const queryData = {
            query: `query Inklings($journalId: BigInt!) {
                inklings(journalId: $journalId) {
                    timeId
                    journalId
                    text
                }
            }`,
            variables: { journalId: JOURNAL_NAME2 },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should create 5 User 1 Journal 2 Inklings", async () => {
        const queryData = {
            query: `mutation CommitInklings($commitInklingsJournalId: BigInt!, $inklingTexts: [String]!) {
                commitInklings(journalId: $commitInklingsJournalId, inklingTexts: $inklingTexts) {
                    timeId
                    journalId
                    text
                }
              }`,
            variables: {
                commitInklingsJournalId: JOURNAL_NAME2,
                inklingTexts: USER1_JOURNAL2_INKLINGS1,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should get 5 User 1 Journal 2 Inklings", async () => {
        const queryData = {
            query: `query Inklings($journalId: BigInt!) {
                inklings(journalId: $journalId) {
                    timeId
                    journalId
                    text
                }
            }`,
            variables: { journalId: JOURNAL_NAME2 },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.inklings.length).toBe(5);
    });

    it("Should log in as another user", async () => {
        // "Logout"
        agent = supertest.agent(s);

        // Create new User/ Login
        await agent
            .post("/login/create-user")
            .send({ userId: USER_ID2, password: PASSWORD2 });
    });

    it("Should fail to get any User2 Journal3 Inklings before they are made", async () => {
        const queryData = {
            query: `query Inklings($journalId: BigInt!) {
                inklings(journalId: $journalId) {
                    timeId
                    journalId
                    text
                }
            }`,
            variables: { journalId: JOURNAL_NAME3 },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should fail to get any User1 Journal1 Inklings as User2", async () => {
        const queryData = {
            query: `query Inklings($journalId: BigInt!) {
                inklings(journalId: $journalId) {
                    timeId
                    journalId
                    text
                }
            }`,
            variables: { journalId: JOURNAL_NAME1 },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should fail to get any User1 Journal2 Inklings as User2", async () => {
        const queryData = {
            query: `query Inklings($journalId: BigInt!) {
                inklings(journalId: $journalId) {
                    timeId
                    journalId
                    text
                }
            }`,
            variables: { journalId: JOURNAL_NAME2 },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should create User 2 Journal 3", async () => {
        const queryData = {
            query: `mutation CreateJournal($journalName: String!) {
                createJournal(journalName: $journalName) {
                    id
                    userId
                    name
                }
              }`,
            variables: {
                journalName: JOURNAL_NAME3,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should create User 2 Journal 3 Inklings", async () => {
        const queryData = {
            query: `mutation CommitInklings($commitInklingsJournalId: BigInt!, $inklingTexts: [String]!) {
                commitInklings(journalId: $commitInklingsJournalId, inklingTexts: $inklingTexts) {
                    timeId
                    journalId
                    text
                }
              }`,
            variables: {
                commitInklingsJournalId: JOURNAL_NAME3,
                inklingTexts: USER2_JOURNAL3_INKLINGS1,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should get 5 User 2 Journal 3 Inklings", async () => {
        const queryData = {
            query: `query Inklings($journalId: BigInt!) {
                inklings(journalId: $journalId) {
                    timeId
                    journalId
                    text
                }
            }`,
            variables: { journalId: JOURNAL_NAME3 },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.inklings.length).toBe(5);
    });

    it("Should still fail to get any User1 Journal1 Inklings as User2", async () => {
        const queryData = {
            query: `query Inklings($journalId: BigInt!) {
                inklings(journalId: $journalId) {
                    timeId
                    journalId
                    text
                }
            }`,
            variables: { journalId: JOURNAL_NAME1 },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should still fail to get any User1 Journal2 Inklings as User2", async () => {
        const queryData = {
            query: `query Inklings($journalId: BigInt!) {
                inklings(journalId: $journalId) {
                    timeId
                    journalId
                    text
                }
            }`,
            variables: { journalId: JOURNAL_NAME2 },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    afterAll(async () => {
        // await prisma.$queryRaw`TRUNCATE TABLE "User" CASCADE;`;
        await prisma.$queryRaw`ALTER SEQUENCE "Journal_id_seq" RESTART WITH 1;`;

        await prisma.$disconnect();
        await s.close();
    });
});
