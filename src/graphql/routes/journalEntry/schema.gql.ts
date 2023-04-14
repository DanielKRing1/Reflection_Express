import { TimestampTzPg } from "../../../types/db.types";
import { SchemaFragment } from "../../types/schema.types";

export default {
    Types: `
    type JournalEntry {
      timeId: DateTime!
      journalId: BigInt!
      reflections: [Reflection]!
    }

    type Thought {
      timeId: DateTime!
      journalId: BigInt!
      text: String!
    }

    type Reflection {
      thoughtId: DateTime!
      decision: Int!
    }
  `,
    Query: `
    journalEntries(journalId: BigInt!, cursorTime: DateTime, count: Int): [JournalEntry]!
    thoughts(journalId: ID!, thoughtIds: [DateTime]!): [Thought]!
  `,
    Mutation: `
    createJournalEntry(journalId: BigInt!, keepIdsInkling: [DateTime]!, keepIdsThought: [DateTime]!, discardIdsThought: [DateTime]!, discardIdsInkling: [DateTime]!): Boolean!
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
