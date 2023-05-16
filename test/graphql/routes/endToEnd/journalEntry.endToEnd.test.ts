import http from "http";
import supertest from "supertest";

import server from "../../../../src/index";
import prisma from "../../../../src/prisma/client";
import { Inkling } from "@prisma/client";
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

const PAST_DATE = new Date(2023, 3, 15);
const PRESENT_DATE = new Date(2023, 3, 16);
const FUTURE_DATE = new Date(2023, 3, 18);

describe("JournalEntry GraphQL server", () => {
    let s: http.Server;
    let agent: supertest.SuperAgentTest;

    let journal1Id: number;
    let journal2Id: number;
    let journal3Id: number;
    let inklings: Inkling[] = [];

    beforeAll(async () => {
        // Mock Date constructor
        useFakeTimer(PRESENT_DATE);

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

    it("Should create User1 Journal 1 JournalEntry1", async () => {
        const queryData = {
            query: `mutation CreateJournalEntry($createJournalEntryJournalId: BigInt!, $keepIdsInkling: [DateTime]!, $keepIdsThought: [DateTime]!, $discardIdsThought: [DateTime]!, $discardIdsInkling: [DateTime]!) {
                createJournalEntry(journalId: $createJournalEntryJournalId, keepIdsInkling: $keepIdsInkling, keepIdsThought: $keepIdsThought, discardIdsThought: $discardIdsThought, discardIdsInkling: $discardIdsInkling) {
                    timeId
                    journalId
                    reflections {
                      thoughtId,
                      decision
                    }
                  }
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

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should get User 1 Journal 1 JournalEntry 1 with count 5", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal1Id,
                cursorTime: FUTURE_DATE,
                count: 5,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(1);
    });

    it("Should get User 1 Journal 1 JournalEntry 1 with count 1", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal1Id,
                cursorTime: FUTURE_DATE,
                count: 1,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(1);
    });

    it("Should fail to get User 1 Journal 1 JournalEntry 1 with count 0", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal1Id,
                cursorTime: FUTURE_DATE,
                count: 0,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(0);
    });

    it("Should get User 1 Journal 1 JournalEntry 1 with cursorTime FUTURE_DATE", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal1Id,
                cursorTime: FUTURE_DATE,
                count: 5,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(1);
    });

    it("Should fail to get User 1 Journal 1 JournalEntry 1 with cursorTime PAST_DATE", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal1Id,
                cursorTime: PAST_DATE,
                count: 5,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(0);
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

    it("Should create User 1 Journal 1 JournalEntry 2", async () => {
        const queryData = {
            query: `mutation CreateJournalEntry($createJournalEntryJournalId: BigInt!, $keepIdsInkling: [DateTime]!, $keepIdsThought: [DateTime]!, $discardIdsThought: [DateTime]!, $discardIdsInkling: [DateTime]!) {
                createJournalEntry(journalId: $createJournalEntryJournalId, keepIdsInkling: $keepIdsInkling, keepIdsThought: $keepIdsThought, discardIdsThought: $discardIdsThought, discardIdsInkling: $discardIdsInkling) {
                    timeId
                    journalId
                    reflections {
                      thoughtId,
                      decision
                    }
                  }
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
        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should get User 1 Journal 1 JournalEntry 1 and 2 with count 5", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal1Id,
                cursorTime: FUTURE_DATE,
                count: 5,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(2);
    });

    it("Should get User 1 Journal 1 JournalEntry 1 with count 1", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal1Id,
                cursorTime: FUTURE_DATE,
                count: 1,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(1);
    });

    it("Should fail to get any User 1 Journal 1 JournalEntries with cursorTime PRESENT_DATE", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal1Id,
                cursorTime: PRESENT_DATE,
                count: 5,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(0);
    });

    it("Should get User 1 Journal 1 JournalEntry 2 with cursorTime PRESENT_DATE + 10.001 seconds and count 1", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal1Id,
                cursorTime: new Date(PRESENT_DATE.getTime() + 1000 * 10 + 1),
                count: 1,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries[0].timeId).toBe(
            new Date(PRESENT_DATE.getTime() + 1000 * 10).getTime()
        );
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(1);
    });

    it("Should get User 1 Journal 1 JournalEntry 1 with cursorTime PRESENT_DATE + 10 seconds and count 1", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal1Id,
                cursorTime: new Date(PRESENT_DATE.getTime() + 1000 * 10),
                count: 1,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries[0].timeId).toBe(
            new Date(PRESENT_DATE.getTime()).getTime()
        );
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(1);
    });

    it("Should get User 1 Journal 1 JournalEntry 1 and 2 with cursorTime PRESENT_DATE + 10.001 seconds", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal1Id,
                cursorTime: new Date(PRESENT_DATE.getTime() + 1000 * 10 + 1),
                count: 5,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(2);
    });

    it("Should get User 1 Journal 1 JournalEntry 2 with cursorTime FUTURE_DATE + 10.001 seconds and count 1", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal1Id,
                cursorTime: new Date(FUTURE_DATE.getTime() + 1000 * 10 + 1),
                count: 1,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(1);
    });

    it("Should fail to get User 1 Journal 1 JournalEntry 1 or 2 with count 0", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal1Id,
                cursorTime: FUTURE_DATE,
                count: 0,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(0);
    });

    it("Should get User 1 Journal 1 JournalEntry 1 and 2 with cursorTime FUTURE_DATE", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal1Id,
                cursorTime: FUTURE_DATE,
                count: 5,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(2);
    });

    it("Should fail to get User 1 Journal 1 JournalEntry 1 with cursorTime new PAST_DATE", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal1Id,
                cursorTime: PAST_DATE,
                count: 5,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(0);
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

    it("Should create User 1 Journal 2 JournalEntry 1", async () => {
        // Advance 10 seconds
        advanceFakeTimer(1000 * 10);

        const queryData = {
            query: `mutation CreateJournalEntry($createJournalEntryJournalId: BigInt!, $keepIdsInkling: [DateTime]!, $keepIdsThought: [DateTime]!, $discardIdsThought: [DateTime]!, $discardIdsInkling: [DateTime]!) {
                createJournalEntry(journalId: $createJournalEntryJournalId, keepIdsInkling: $keepIdsInkling, keepIdsThought: $keepIdsThought, discardIdsThought: $discardIdsThought, discardIdsInkling: $discardIdsInkling) {
                    timeId
                    journalId
                    reflections {
                      thoughtId,
                      decision
                    }
                  }
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
        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should get User 1 Journal 2 JournalEntry 1 with count 5", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal2Id,
                cursorTime: FUTURE_DATE,
                count: 5,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(1);
    });

    it("Should get User 1 Journal 2 JournalEntry 1 with count 1", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal2Id,
                cursorTime: FUTURE_DATE,
                count: 1,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(1);
    });

    it("Should fail to get User 1 Journal 2 JournalEntry 1 with count 0", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal2Id,
                cursorTime: FUTURE_DATE,
                count: 0,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(0);
    });

    it("Should get User 1 Journal 2 JournalEntry 1 with cursorTime FUTURE_DATE", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal2Id,
                cursorTime: FUTURE_DATE,
                count: 5,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(1);
    });

    it("Should fail to get User 1 Journal 2 JournalEntry 1 with cursorTime PAST_DATE", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal2Id,
                cursorTime: PAST_DATE,
                count: 5,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should log in as another user", async () => {
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

    it("Should create User 2 Journal 3 JournalEntry 1", async () => {
        const queryData = {
            query: `mutation CreateJournalEntry($createJournalEntryJournalId: BigInt!, $keepIdsInkling: [DateTime]!, $keepIdsThought: [DateTime]!, $discardIdsThought: [DateTime]!, $discardIdsInkling: [DateTime]!) {
                createJournalEntry(journalId: $createJournalEntryJournalId, keepIdsInkling: $keepIdsInkling, keepIdsThought: $keepIdsThought, discardIdsThought: $discardIdsThought, discardIdsInkling: $discardIdsInkling) {
                    timeId
                    journalId
                    reflections {
                      thoughtId,
                      decision
                    }
                  }
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
        expect(JSON.parse(res.text)).toMatchSnapshot();
    });

    it("Should get User 2 Journal 3 JournalEntry 1 with count 5", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal3Id,
                cursorTime: FUTURE_DATE,
                count: 5,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(1);
    });

    it("Should get User 2 Journal 3 JournalEntry 1 with count 1", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal3Id,
                cursorTime: FUTURE_DATE,
                count: 1,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(1);
    });

    it("Should fail to get User 2 Journal 3 JournalEntry 1 with count 0", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal3Id,
                cursorTime: FUTURE_DATE,
                count: 0,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(0);
    });

    it("Should get User 2 Journal 3 JournalEntry 1 with cursorTime FUTURE_DATE", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal3Id,
                cursorTime: FUTURE_DATE,
                count: 5,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(1);
    });

    it("Should fail to get User 1 Journal 2 JournalEntry 1 with cursorTime PAST_DATE", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal3Id,
                cursorTime: PAST_DATE,
                count: 5,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data.journalEntries.length).toBe(0);
    });

    it("Should fail to get User 1 Journal 1 JournalEntries as User 2", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal1Id,
                cursorTime: FUTURE_DATE,
                count: 5,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data).toBe(null);
    });

    it("Should fail to get User 1 Journal 2 JournalEntries as User 2", async () => {
        const queryData = {
            query: `query JournalEntries($journalId: BigInt!, $cursorTime: DateTime, $count: Int) {
                journalEntries(journalId: $journalId, cursorTime: $cursorTime, count: $count) {
                  timeId
                  journalId
                  reflections {
                    thoughtId,
                    decision
                  }
                }
              }`,
            variables: {
                journalId: journal2Id,
                cursorTime: FUTURE_DATE,
                count: 5,
            },
        };

        const res = await agent.post("/graphql").send(queryData);

        expect(JSON.parse(res.text)).toMatchSnapshot();
        expect(JSON.parse(res.text).data).toBe(null);
    });

    afterAll(async () => {
        // Unmock Date constructor
        useRealTimer();

        // await prisma.$queryRaw`TRUNCATE TABLE "User" CASCADE;`;
        await prisma.$queryRaw`ALTER SEQUENCE "Journal_id_seq" RESTART WITH 1;`;

        await prisma.$disconnect();
        await s.close();
    });
});
