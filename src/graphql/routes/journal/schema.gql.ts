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

export type JournalsArgs = {};

// MUTATION RESOLVERS

export type CreateJournalArgs = {
    journalName: string;
};
