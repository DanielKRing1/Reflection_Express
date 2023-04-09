import { TimestampTzPg } from "../../../types/db.types";
import { SchemaFragment } from "../../types/schema.types";

export default {
    Types: `
    type JournalEntry {
      timeId: DateTime!
      journalId: Int!
      reflections: [Reflection]!
    }

    type Thought {
      timeId: DateTime!
      journalId: Int!
      text: String!
    }

    type Reflection {
      thoughtId: DateTime!
      decision: Int!
    }
  `,
    Query: `
    journalEntries(journalId: Int!, cursorTime: DateTime, count: Int): [JournalEntry]!
    thoughts(journalId: ID!, thoughtIds: [DateTime]!): [Thought]!
  `,
    Mutation: `
    createJournalEntry(journalId: Int!, keepIdsInkling: [DateTime]!, keepIdsThought: [DateTime]!, discardIdsThought: [DateTime]!, discardIdsInkling: [DateTime]!): Boolean!
  `,
} as SchemaFragment;

// QUERY RESOLVERS

export type JournalEntriesArgs = {
    journalId: number;
    cursorTime: TimestampTzPg;
    count: number;
};

export type ThoughtsArgs = {
    journalId: number;
    thoughtIds: TimestampTzPg[];
};

// MUTATION RESOLVERS

export type CreateJournalEntryArgs = {
    journalId: number;
    discardIdsThought: TimestampTzPg[];
    keepIdsThought: TimestampTzPg[];
    keepIdsInkling: TimestampTzPg[];
    discardIdsInkling: TimestampTzPg[];
};

// TYPES

export enum ReflectionDecision {
    DiscardThought,
    KeepThought,
    KeepInkling,
    DiscardInkling,
}
