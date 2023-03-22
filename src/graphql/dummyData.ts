import { Dict } from "../types/global.types";
import { serializeDate } from "../utils/date";
import { Inkling } from "./inkling/schema.gql";
import { Journal } from "./journal/schema.gql";
import {
  JournalEntry,
  ReflectionDecision,
  Thought,
} from "./journalEntry/schema.gql";

export default {
  Journals: {
    1: {
      id: 1,
      userId: 1,
      name: "Journal1",
    },
    2: {
      id: 2,
      userId: 1,
      name: "Journal2",
    },
    3: {
      id: 3,
      userId: 1,
      name: "Journal3",
    },
  },
  Inklings: {
    [serializeDate(new Date(1))]: {
      timeId: serializeDate(new Date(1)),
      journalId: 1,
      text: "Inkling1",
    },
    [serializeDate(new Date(2))]: {
      timeId: serializeDate(new Date(2)),
      journalId: 1,
      text: "Inkling2",
    },
    [serializeDate(new Date(3))]: {
      timeId: serializeDate(new Date(3)),
      journalId: 1,
      text: "Inkling3",
    },
    [serializeDate(new Date(4))]: {
      timeId: serializeDate(new Date(4)),
      journalId: 1,
      text: "Inkling4",
    },
    [serializeDate(new Date(5))]: {
      timeId: serializeDate(new Date(5)),
      journalId: 1,
      text: "Inkling5",
    },
  },
  JournalEntries: {
    [serializeDate(new Date(1))]: {
      timeId: serializeDate(new Date(1)),
      journalId: 1,
      reflections: [
        {
          thoughtId: serializeDate(new Date(1)),
          decision: ReflectionDecision.KeepInkling,
        },
        {
          thoughtId: serializeDate(new Date(2)),
          decision: ReflectionDecision.KeepInkling,
        },
        {
          thoughtId: serializeDate(new Date(3)),
          decision: ReflectionDecision.DiscardInkling,
        },
        {
          thoughtId: serializeDate(new Date(4)),
          decision: ReflectionDecision.DiscardInkling,
        },
        {
          thoughtId: serializeDate(new Date(5)),
          decision: ReflectionDecision.DiscardInkling,
        },
      ],
    },
    2: {
      timeId: 2,
      journalId: 1,
      reflections: [
        {
          thoughtId: 1,
          decision: ReflectionDecision.KeepThought,
        },
        {
          thoughtId: 2,
          decision: ReflectionDecision.KeepThought,
        },
        {
          thoughtId: 6,
          decision: ReflectionDecision.KeepInkling,
        },
        {
          thoughtId: 7,
          decision: ReflectionDecision.DiscardInkling,
        },
        {
          thoughtId: 8,
          decision: ReflectionDecision.DiscardInkling,
        },
      ],
    },
    3: {
      timeId: 3,
      journalId: 1,
      reflections: [
        {
          thoughtId: 1,
          decision: ReflectionDecision.KeepThought,
        },
        {
          thoughtId: 6,
          decision: ReflectionDecision.KeepThought,
        },
        {
          thoughtId: 9,
          decision: ReflectionDecision.KeepInkling,
        },
        {
          thoughtId: 10,
          decision: ReflectionDecision.DiscardInkling,
        },
        {
          thoughtId: 11,
          decision: ReflectionDecision.DiscardInkling,
        },
      ],
    },
  },
  Thoughts: {
    [serializeDate(new Date(1))]: {
      timeId: serializeDate(new Date(1)),
      journalId: 1,
      text: "Thought1",
    },
    [serializeDate(new Date(2))]: {
      timeId: serializeDate(new Date(2)),
      journalId: 1,
      text: "Thought3",
    },
    [serializeDate(new Date(3))]: {
      timeId: serializeDate(new Date(3)),
      journalId: 1,
      text: "Thought3",
    },
    [serializeDate(new Date(4))]: {
      timeId: serializeDate(new Date(4)),
      journalId: 1,
      text: "Thought4",
    },
    [serializeDate(new Date(5))]: {
      timeId: serializeDate(new Date(5)),
      journalId: 1,
      text: "Thought5",
    },
    [serializeDate(new Date(6))]: {
      timeId: serializeDate(new Date(6)),
      journalId: 1,
      text: "Thought6",
    },
    [serializeDate(new Date(7))]: {
      timeId: serializeDate(new Date(7)),
      journalId: 1,
      text: "Thought7",
    },
    [serializeDate(new Date(8))]: {
      timeId: serializeDate(new Date(8)),
      journalId: 1,
      text: "Thought8",
    },
    [serializeDate(new Date(9))]: {
      timeId: serializeDate(new Date(9)),
      journalId: 1,
      text: "Thought9",
    },
    [serializeDate(new Date(10))]: {
      timeId: serializeDate(new Date(10)),
      journalId: 1,
      text: "Thought10",
    },
  },
} as {
  Journals: Dict<Journal>;
  Inklings: Dict<Inkling>;
  JournalEntries: Dict<JournalEntry>;
  Thoughts: Dict<Thought>;
};
