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
    journalEntries(userId: String!, journalId: Int!, cursorTime: DateTime, count: Int): [JournalEntry]!
    thoughts(userId: String!, journalId: ID!, thoughtIds: [DateTime]!): [Thought]!
  `,
    Mutation: `
    createJournalEntry(userId: String!, journalId: Int!, keepIdsInkling: [DateTime]!, keepIdsThought: [DateTime]!, discardIdsThought: [DateTime]!, discardIdsInkling: [DateTime]!): Boolean!
  `,
} as SchemaFragment;

// QUERY RESOLVERS

export type JournalEntriesArgs = {
    userId: string;
    journalId: number;
    cursorTime: TimestampTzPg;
    count: number;
};

export type ThoughtsArgs = {
    userId: string;
    journalId: number;
    thoughtIds: TimestampTzPg[];
};

// MUTATION RESOLVERS

export type CreateJournalEntryArgs = {
    userId: string;
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
