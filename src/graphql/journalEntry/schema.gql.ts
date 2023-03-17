import { SchemaFragment } from "../types/schema.types";

export default {
  Types: `
    type JournalEntry {
      timeId: Int!
      journalId: Int!
      reflections: [Reflection]!
    }

    type Thought {
      timeId: Int!
      journalId: Int!
      text: String!
    }

    type Reflection {
      thoughtId: Int!
      decision: Int!
    }
  `,
  Query: `
    journalEntries(userId: Int!, journalId: Int!, cursorTime: Int!, count: Int): [JournalEntry]!
    thoughts(userId: Int!, journalId: ID!, thoughtIds: [Int]!): [Thought]!
  `,
  Mutation: `
    createJournalEntry(userId: Int!, journalId: Int!, keepIds: [Int]!, discardIds: [Int]!): Boolean!
  `,
} as SchemaFragment;

export type JournalEntry = {
  timeId: number;
  journalId: number;
  reflections: Reflection[];
};

export type Thought = {
  timeId: number;
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
  thoughtId: number;
  decision: ReflectionDecision;
};
