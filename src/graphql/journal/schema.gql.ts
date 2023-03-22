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
    journals(userId: Int!): [Journal]!
  `,
  Mutation: `
    createJournal(userId: Int!, journalName: String!): Int!
  `,
} as SchemaFragment;

// QUERY RESOLVERS

export type JournalsArgs = {
  userId: number;
};

// MUTATION RESOLVERS

export type CreateJournalArgs = {
  userId: number;
  journalName: string;
};

// TYPES

export type Journal = {
  id: number;
  userId: number;
  name: string;
};
