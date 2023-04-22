import http from "http";
import supertest from "supertest";

import server from "../../../../src/index";
import prisma from "../../../../src/prisma/client";
import { Inkling, Thought } from "@prisma/client";
import {
    advanceFakeTimer,
    useFakeTimer,
    useRealTimer,
} from "../../../../jest/utils/time";

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

describe("JournalEntry GraphQL server", () => {
    let s: http.Server;
    let agent: supertest.SuperAgentTest;

    let journal1Id: number;
    let journal2Id: number;
    let journal3Id: number;
    let inklings: Inkling[] = [];
    let journal1Thoughts: Thought[] = [];

    beforeAll(async () => {
        // Mock Date constructor
        useFakeTimer(new Date(2023, 4, 16));

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

        journal1Id = JSON.parse(res.text).data.createJournal.id;
        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should create 5 User 1 Journal 1 Inklings", async () => {
        const queryData = {
            query: `mutation CommitInklings($commitInklingsJournalId: BigInt!, $inklingTexts: [String]!) {
                commitInklings(journalId: $commitInklingsJournalId, inklingTexts: $inklingTexts)
                {
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
        inklings = JSON.parse(res.text).data.commitInklings.sort(
            (a: any, b: any) => new Date(a).getTime() - new Date(b).getTime()
        );

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should get convert User 1 Journal 1 Inkling into Thoughts", async () => {
        const queryData = {
            query: `mutation CreateJournalEntry($createJournalEntryJournalId: BigInt!, $keepIdsInkling: [DateTime]!, $keepIdsThought: [DateTime]!, $discardIdsThought: [DateTime]!, $discardIdsInkling: [DateTime]!) {
                createJournalEntry(journalId: $createJournalEntryJournalId, keepIdsInkling: $keepIdsInkling, keepIdsThought: $keepIdsThought, discardIdsThought: $discardIdsThought, discardIdsInkling: $discardIdsInkling)
              }`,
            variables: {
                createJournalEntryJournalId: journal1Id,
                keepIdsInkling: inklings
                    .map((inkling: Inkling) => inkling.timeId)
                    .slice(0, 4),
                discardIdsInkling: inklings
                    .map((inkling: Inkling) => inkling.timeId)
                    .slice(4, 5),
                keepIdsThought: [],
                discardIdsThought: [],
            },
        };

        const res = await agent.post("/graphql").send(queryData);
    });

    it("Should get User 1 Journal 1 Thoughts 1 - 5", async () => {
        const queryData = {
            query: `query Thoughts($journalId: ID!, $thoughtIds: [DateTime]!) {
                thoughts(journalId: $journalId, thoughtIds: $thoughtIds) {
                  timeId
                  journalId
                  text
                }
              }`,
            variables: {
                journalId: journal1Id,
                thoughtIds: inklings.map((inkling: Inkling) => inkling.timeId),
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        journal1Thoughts = JSON.parse(res.text).data.thoughts;
        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should get User 1 Journal 1 Thoughts only 1 - 2", async () => {
        const queryData = {
            query: `query Thoughts($journalId: ID!, $thoughtIds: [DateTime]!) {
                thoughts(journalId: $journalId, thoughtIds: $thoughtIds) {
                  timeId
                  journalId
                  text
                }
              }`,
            variables: {
                journalId: journal1Id,
                thoughtIds: inklings
                    .map((inkling: Inkling) => inkling.timeId)
                    .slice(0, 2),
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should create 5 more User 1 Journal 1 Inklings", async () => {
        // Advance 10 seconds
        advanceFakeTimer(1000 * 10);

        const queryData = {
            query: `mutation CommitInklings($commitInklingsJournalId: BigInt!, $inklingTexts: [String]!) {
                commitInklings(journalId: $commitInklingsJournalId, inklingTexts: $inklingTexts)
                {
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
        inklings = JSON.parse(res.text).data.commitInklings.sort(
            (a: any, b: any) => new Date(a).getTime() - new Date(b).getTime()
        );

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should get convert User 1 Journal 1 Inkling into Thoughts", async () => {
        const queryData = {
            query: `mutation CreateJournalEntry($createJournalEntryJournalId: BigInt!, $keepIdsInkling: [DateTime]!, $keepIdsThought: [DateTime]!, $discardIdsThought: [DateTime]!, $discardIdsInkling: [DateTime]!) {
                createJournalEntry(journalId: $createJournalEntryJournalId, keepIdsInkling: $keepIdsInkling, keepIdsThought: $keepIdsThought, discardIdsThought: $discardIdsThought, discardIdsInkling: $discardIdsInkling)
              }`,
            variables: {
                createJournalEntryJournalId: journal1Id,
                keepIdsInkling: inklings
                    .map((inkling: Inkling) => inkling.timeId)
                    .slice(0, 4),
                discardIdsInkling: inklings
                    .map((inkling: Inkling) => inkling.timeId)
                    .slice(4, 5),
                keepIdsThought: [],
                discardIdsThought: [],
            },
        };

        const res = await agent.post("/graphql").send(queryData);
    });

    it("Should get User 1 Journal 1 Thoughts 5 - 10", async () => {
        const queryData = {
            query: `query Thoughts($journalId: ID!, $thoughtIds: [DateTime]!) {
                thoughts(journalId: $journalId, thoughtIds: $thoughtIds) {
                  timeId
                  journalId
                  text
                }
              }`,
            variables: {
                journalId: journal1Id,
                thoughtIds: inklings.map((inkling: Inkling) => inkling.timeId),
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should get User 1 Journal 1 Thoughts only 4 - 5", async () => {
        const queryData = {
            query: `query Thoughts($journalId: ID!, $thoughtIds: [DateTime]!) {
                thoughts(journalId: $journalId, thoughtIds: $thoughtIds) {
                  timeId
                  journalId
                  text
                }
              }`,
            variables: {
                journalId: journal1Id,
                thoughtIds: inklings
                    .map((inkling: Inkling) => inkling.timeId)
                    .slice(3),
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
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

        journal2Id = JSON.parse(res.text).data.createJournal.id;
        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should create 5 User 1 Journal 2 Inklings", async () => {
        const queryData = {
            query: `mutation CommitInklings($commitInklingsJournalId: BigInt!, $inklingTexts: [String]!) {
                commitInklings(journalId: $commitInklingsJournalId, inklingTexts: $inklingTexts)
                {
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
        inklings = JSON.parse(res.text).data.commitInklings.sort(
            (a: any, b: any) => new Date(a).getTime() - new Date(b).getTime()
        );

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should get convert User 1 Journal 2 Inkling into Thoughts", async () => {
        const queryData = {
            query: `mutation CreateJournalEntry($createJournalEntryJournalId: BigInt!, $keepIdsInkling: [DateTime]!, $keepIdsThought: [DateTime]!, $discardIdsThought: [DateTime]!, $discardIdsInkling: [DateTime]!) {
                createJournalEntry(journalId: $createJournalEntryJournalId, keepIdsInkling: $keepIdsInkling, keepIdsThought: $keepIdsThought, discardIdsThought: $discardIdsThought, discardIdsInkling: $discardIdsInkling)
              }`,
            variables: {
                createJournalEntryJournalId: journal2Id,
                keepIdsInkling: inklings
                    .map((inkling: Inkling) => inkling.timeId)
                    .slice(0, 4),
                discardIdsInkling: inklings
                    .map((inkling: Inkling) => inkling.timeId)
                    .slice(4, 5),
                keepIdsThought: [],
                discardIdsThought: [],
            },
        };

        const res = await agent.post("/graphql").send(queryData);
    });

    it("Should get User 1 Journal 2 Thoughts 1 - 5", async () => {
        const queryData = {
            query: `query Thoughts($journalId: ID!, $thoughtIds: [DateTime]!) {
                thoughts(journalId: $journalId, thoughtIds: $thoughtIds) {
                  timeId
                  journalId
                  text
                }
              }`,
            variables: {
                journalId: journal2Id,
                thoughtIds: inklings.map((inkling: Inkling) => inkling.timeId),
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should get User 1 Journal 2 Thoughts only 1 - 2", async () => {
        const queryData = {
            query: `query Thoughts($journalId: ID!, $thoughtIds: [DateTime]!) {
                thoughts(journalId: $journalId, thoughtIds: $thoughtIds) {
                  timeId
                  journalId
                  text
                }
              }`,
            variables: {
                journalId: journal2Id,
                thoughtIds: inklings
                    .map((inkling: Inkling) => inkling.timeId)
                    .slice(0, 2),
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should log in as User 2", async () => {
        // "Logout"
        agent = supertest.agent(s);

        // Create new User/ Login
        await agent
            .post("/login/create-user")
            .send({ userId: USER_ID2, password: PASSWORD2 });
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

        journal3Id = JSON.parse(res.text).data.createJournal.id;
        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should create 5 User 2 Journal 3 Inklings", async () => {
        const queryData = {
            query: `mutation CommitInklings($commitInklingsJournalId: BigInt!, $inklingTexts: [String]!) {
                commitInklings(journalId: $commitInklingsJournalId, inklingTexts: $inklingTexts)
                {
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
        inklings = JSON.parse(res.text).data.commitInklings.sort(
            (a: any, b: any) => new Date(a).getTime() - new Date(b).getTime()
        );

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should get convert User 2 Journal 3 Inkling into Thoughts", async () => {
        const queryData = {
            query: `mutation CreateJournalEntry($createJournalEntryJournalId: BigInt!, $keepIdsInkling: [DateTime]!, $keepIdsThought: [DateTime]!, $discardIdsThought: [DateTime]!, $discardIdsInkling: [DateTime]!) {
                createJournalEntry(journalId: $createJournalEntryJournalId, keepIdsInkling: $keepIdsInkling, keepIdsThought: $keepIdsThought, discardIdsThought: $discardIdsThought, discardIdsInkling: $discardIdsInkling)
              }`,
            variables: {
                createJournalEntryJournalId: journal3Id,
                keepIdsInkling: inklings
                    .map((inkling: Inkling) => inkling.timeId)
                    .slice(0, 4),
                discardIdsInkling: inklings
                    .map((inkling: Inkling) => inkling.timeId)
                    .slice(4, 5),
                keepIdsThought: [],
                discardIdsThought: [],
            },
        };

        const res = await agent.post("/graphql").send(queryData);
    });

    it("Should get User 2 Journal 3 Thoughts 1 - 5", async () => {
        const queryData = {
            query: `query Thoughts($journalId: ID!, $thoughtIds: [DateTime]!) {
                thoughts(journalId: $journalId, thoughtIds: $thoughtIds) {
                  timeId
                  journalId
                  text
                }
              }`,
            variables: {
                journalId: journal3Id,
                thoughtIds: inklings.map((inkling: Inkling) => inkling.timeId),
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should get User 2 Journal 3 Thoughts only 1 - 2", async () => {
        const queryData = {
            query: `query Thoughts($journalId: ID!, $thoughtIds: [DateTime]!) {
                thoughts(journalId: $journalId, thoughtIds: $thoughtIds) {
                  timeId
                  journalId
                  text
                }
              }`,
            variables: {
                journalId: journal3Id,
                thoughtIds: inklings
                    .map((inkling: Inkling) => inkling.timeId)
                    .slice(0, 2),
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should fail to get User 1 Journal 1 Thoughts", async () => {
        const queryData = {
            query: `query Thoughts($journalId: ID!, $thoughtIds: [DateTime]!) {
                thoughts(journalId: $journalId, thoughtIds: $thoughtIds) {
                  timeId
                  journalId
                  text
                }
              }`,
            variables: {
                journalId: journal1Id,
                thoughtIds: journal1Thoughts.map(
                    (thought: Thought) => thought.timeId
                ),
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    afterAll(async () => {
        // Unmock Date constructor
        useRealTimer();

        await prisma.$queryRaw`TRUNCATE TABLE "User" CASCADE;`;
        await prisma.$queryRaw`ALTER SEQUENCE "Journal_id_seq" RESTART WITH 1;`;

        await prisma.$disconnect();
        await s.close();
    });
});
