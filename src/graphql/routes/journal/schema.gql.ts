import { SchemaFragment } from "../../types/schema.types";

export default {
  Types: `
    type User {
      id: Int!
      lastUsedJournalId: Int
    }

    type Journal {
      id: Int!
      userId: String!
      name: String!
    }
  `,
  Query: `
    journals(userId: String!): [Journal]!
  `,
  Mutation: `
    createJournal(userId: String!, journalName: String!): Int!
  `,
} as SchemaFragment;

// QUERY RESOLVERS

export type JournalsArgs = {
  userId: string;
};

// MUTATION RESOLVERS

export type CreateJournalArgs = {
  userId: string;
  journalName: string;
};

// TYPES

export type Journal = {
  id: number;
  userId: string;
  name: string;
};