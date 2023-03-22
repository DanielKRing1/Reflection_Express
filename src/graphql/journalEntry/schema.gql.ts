import { TimestampTzPg } from "../../types/db.types";
import { SchemaFragment } from "../types/schema.types";

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
    journalEntries(userId: Int!, journalId: Int!, cursorTime: DateTime, count: Int): [JournalEntry]!
    thoughts(userId: Int!, journalId: ID!, thoughtIds: [DateTime]!): [Thought]!
  `,
  Mutation: `
    createJournalEntry(userId: Int!, journalId: Int!, keepIds: [DateTime]!, discardIds: [DateTime]!): Boolean!
  `,
} as SchemaFragment;

export type JournalEntry = {
  timeId: TimestampTzPg;
  journalId: number;
  reflections: Reflection[];
};

// QUERY RESOLVERS

export type JournalEntriesArgs = {
  userId: number;
  journalId: number;
  cursorTime: TimestampTzPg;
  count: number;
};

export type ThoughtsArgs = {
  userId: number;
  journalId: number;
  thoughtIds: TimestampTzPg[];
};

// MUTATION RESOLVERS

export type CreateJournalEntryArgs = {
  userId: number;
  journalId: number;
  keepIds: TimestampTzPg[];
  discardIds: TimestampTzPg[];
};

// TYPES

export type Thought = {
  timeId: TimestampTzPg;
  journalId: number;
  text: string;
};

export enum ReflectionDecision {
  DiscardThought,
  KeepThought,
  KeepInkling,
  DiscardInkling,
}
export type Reflection = {
  thoughtId: TimestampTzPg;
  decision: ReflectionDecision;
};
