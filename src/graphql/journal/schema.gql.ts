import { SchemaFragment } from "../types/schema.types";

export default {
  Types: `
    type User {
      id: Int!
      lastUsedJournalId: Int
    }

    type Journal {
      id: Int!
      userId: Int!
      name: String!
    }
  `,
  Query: `
    journals: [Journal]!
  `,
  Mutation: `
    createJournal(userId: Int!, journalName: String!): Int!
  `,
} as SchemaFragment;

export type Journal = {
  id: number;
  userId: number;
  name: string;
};
