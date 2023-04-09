import {
    User,
    Password,
    Journal,
    JournalEntry,
    Inkling,
    Thought,
    Reflection,
} from "@prisma/client";
import { Dict } from "../types/global.types";
import { serializeDate } from "../utils/date";

import { ReflectionDecision } from "./routes/journalEntry/schema.gql";

export default {
    Users: {
        1: {
            email: "1",
            lastUsedJId: null,
        },
        2: {
            email: "2",
            lastUsedJId: null,
        },
        3: {
            email: "3",
            lastUsedJId: null,
        },
        4: {
            email: "4",
            lastUsedJId: null,
        },
    },
    Passwords: {
        1: {
            userId: "1",
            hash: "1",
        },
    },
    Journals: {
        1: {
            id: 1 as unknown as bigint,
            userId: "1",
            name: "Journal1",
        },
        2: {
            id: 2 as unknown as bigint,
            userId: "1",
            name: "Journal2",
        },
        3: {
            id: 3 as unknown as bigint,
            userId: "1",
            name: "Journal3",
        },
    },
    Inklings: {
        [serializeDate(new Date(1))]: {
            timeId: new Date(1),
            journalId: 1 as unknown as bigint,
            text: "Inkling1",
        },
        [serializeDate(new Date(2))]: {
            timeId: new Date(2),
            journalId: 1 as unknown as bigint,
            text: "Inkling2",
        },
        [serializeDate(new Date(3))]: {
            timeId: new Date(3),
            journalId: 1 as unknown as bigint,
            text: "Inkling3",
        },
        [serializeDate(new Date(4))]: {
            timeId: new Date(4),
            journalId: 1 as unknown as bigint,
            text: "Inkling4",
        },
        [serializeDate(new Date(5))]: {
            timeId: new Date(5),
            journalId: 1 as unknown as bigint,
            text: "Inkling5",
        },
    },
    JournalEntries: {
        [serializeDate(new Date(1))]: {
            timeId: new Date(1),
            journalId: 1 as unknown as bigint,
            reflections: [
                {
                    thoughtId: new Date(1),
                    decision: ReflectionDecision.KeepInkling,
                },
                {
                    thoughtId: new Date(2),
                    decision: ReflectionDecision.KeepInkling,
                },
                {
                    thoughtId: new Date(3),
                    decision: ReflectionDecision.DiscardInkling,
                },
                {
                    thoughtId: new Date(4),
                    decision: ReflectionDecision.DiscardInkling,
                },
                {
                    thoughtId: new Date(5),
                    decision: ReflectionDecision.DiscardInkling,
                },
            ],
        },
        2: {
            timeId: new Date(2),
            journalId: 1 as unknown as bigint,
            reflections: [
                {
                    thoughtId: new Date(1),
                    decision: ReflectionDecision.KeepThought,
                },
                {
                    thoughtId: new Date(2),
                    decision: ReflectionDecision.KeepThought,
                },
                {
                    thoughtId: new Date(6),
                    decision: ReflectionDecision.KeepInkling,
                },
                {
                    thoughtId: new Date(7),
                    decision: ReflectionDecision.DiscardInkling,
                },
                {
                    thoughtId: new Date(8),
                    decision: ReflectionDecision.DiscardInkling,
                },
            ],
        },
        3: {
            timeId: new Date(3),
            journalId: 1 as unknown as bigint,
            reflections: [
                {
                    thoughtId: new Date(1),
                    decision: ReflectionDecision.KeepThought,
                },
                {
                    thoughtId: new Date(6),
                    decision: ReflectionDecision.KeepThought,
                },
                {
                    thoughtId: new Date(9),
                    decision: ReflectionDecision.KeepInkling,
                },
                {
                    thoughtId: new Date(10),
                    decision: ReflectionDecision.DiscardInkling,
                },
                {
                    thoughtId: new Date(11),
                    decision: ReflectionDecision.DiscardInkling,
                },
            ],
        },
    },
    Thoughts: {
        [serializeDate(new Date(1))]: {
            timeId: new Date(1),
            journalId: 1 as unknown as bigint,
            text: "Thought1",
        },
        [serializeDate(new Date(2))]: {
            timeId: new Date(2),
            journalId: 1 as unknown as bigint,
            text: "Thought3",
        },
        [serializeDate(new Date(3))]: {
            timeId: new Date(3),
            journalId: 1 as unknown as bigint,
            text: "Thought3",
        },
        [serializeDate(new Date(4))]: {
            timeId: new Date(4),
            journalId: 1 as unknown as bigint,
            text: "Thought4",
        },
        [serializeDate(new Date(5))]: {
            timeId: new Date(5),
            journalId: 1 as unknown as bigint,
            text: "Thought5",
        },
        [serializeDate(new Date(6))]: {
            timeId: new Date(6),
            journalId: 1 as unknown as bigint,
            text: "Thought6",
        },
        [serializeDate(new Date(7))]: {
            timeId: serializeDate(new Date(7)),
            journalId: 1 as unknown as bigint,
            text: "Thought7",
        },
        [serializeDate(new Date(8))]: {
            timeId: new Date(8),
            journalId: 1 as unknown as bigint,
            text: "Thought8",
        },
        [serializeDate(new Date(9))]: {
            timeId: new Date(9),
            journalId: 1 as unknown as bigint,
            text: "Thought9",
        },
        [serializeDate(new Date(10))]: {
            timeId: new Date(10),
            journalId: 1 as unknown as bigint,
            text: "Thought10",
        },
    },
} as {
    Users: Dict<User>;
    Passwords: Dict<Password>;
    Journals: Dict<Journal>;
    Inklings: Dict<Inkling>;
    JournalEntries: Dict<
        JournalEntry & { reflections: { thoughtId: Date; decision: number }[] }
    >;
    Thoughts: Dict<Thought>;
};
