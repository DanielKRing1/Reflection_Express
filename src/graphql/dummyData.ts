import { Dict } from "../types/global.types";
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
    1: {
      timeId: 1,
      journalId: 1,
      text: "Inkling1",
    },
    2: {
      timeId: 2,
      journalId: 1,
      text: "Inkling2",
    },
    3: {
      timeId: 3,
      journalId: 1,
      text: "Inkling3",
    },
    4: {
      timeId: 4,
      journalId: 1,
      text: "Inkling4",
    },
    5: {
      timeId: 5,
      journalId: 1,
      text: "Inkling5",
    },
  },
  JournalEntries: {
    1: {
      timeId: 1,
      journalId: 1,
      reflections: [
        {
          thoughtId: 1,
          decision: ReflectionDecision.KeepInkling,
        },
        {
          thoughtId: 2,
          decision: ReflectionDecision.KeepInkling,
        },
        {
          thoughtId: 3,
          decision: ReflectionDecision.DiscardInkling,
        },
        {
          thoughtId: 4,
          decision: ReflectionDecision.DiscardInkling,
        },
        {
          thoughtId: 5,
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
    1: {
      timeId: 1,
      journalId: 1,
      text: "Thought1",
    },
    2: {
      timeId: 2,
      journalId: 1,
      text: "Thought3",
    },
    3: {
      timeId: 3,
      journalId: 1,
      text: "Thought3",
    },
    4: {
      timeId: 4,
      journalId: 1,
      text: "Thought4",
    },
    5: {
      timeId: 5,
      journalId: 1,
      text: "Thought5",
    },
    6: {
      timeId: 6,
      journalId: 1,
      text: "Thought6",
    },
    7: {
      timeId: 7,
      journalId: 1,
      text: "Thought7",
    },
    8: {
      timeId: 8,
      journalId: 1,
      text: "Thought8",
    },
    9: {
      timeId: 9,
      journalId: 1,
      text: "Thought9",
    },
    10: {
      timeId: 10,
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
