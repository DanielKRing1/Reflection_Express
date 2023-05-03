import { JournalEntry, Reflection } from "@prisma/client";
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
    createJournalEntry(journalId: BigInt!, keepIdsInkling: [DateTime]!, keepIdsThought: [DateTime]!, discardIdsThought: [DateTime]!, discardIdsInkling: [DateTime]!): JournalEntry!
  `,
} as SchemaFragment;

// QUERY RESOLVERS

export type JournalEntriesArgs = {
    journalId: bigint;
    cursorTime: Date;
    count: number;
};

export type ThoughtsArgs = {
    journalId: bigint;
    thoughtIds: TimestampTzPg[];
};

// MUTATION RESOLVERS

export type CreateJournalEntryArgs = {
    journalId: bigint;
    discardIdsThought: Date[];
    keepIdsThought: Date[];
    keepIdsInkling: Date[];
    discardIdsInkling: Date[];
};

// TYPES

export type JournalEntryWReflection = JournalEntry & {
    reflections: Omit<Reflection, "journalId" | "journalEntryId">[];
};

export enum ReflectionDecision {
    DiscardThought,
    KeepThought,
    KeepInkling,
    DiscardInkling,
}
