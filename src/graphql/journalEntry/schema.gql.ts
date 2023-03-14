import { SchemaFragment } from "../types/schema.types";

export default {
  Types: `
    type JournalEntry {
      timeId: String!
      journalId: ID!
      reflections: [Reflection]!
    }

    type Thought {
      timeId: String!
      text: String!
    }

    type Reflection {
      thought: Thought!
      journalEntryId: String!
      keep: Boolean!
    }
  `,
  Query: `
    journalEntries(userId: ID!, journalId: ID!, cursorId: String, count: Int): [JournalEntry]!
  `,
  Mutation: `
    createJournalEntry(userId: ID!, journalId: ID!, keepIds: [String]!, discardIds: [String]!): Boolean!
  `,
} as SchemaFragment;
