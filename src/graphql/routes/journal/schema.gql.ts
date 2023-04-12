import { SchemaFragment } from "../../types/schema.types";

export default {
    Types: `
    type Journal {
      id: Int!
      userId: String!
      name: String!
    }
  `,
    Query: `
    journals: [Journal]!
  `,
    Mutation: `
    createJournal(journalName: String!): Int!
  `,
} as SchemaFragment;

// QUERY RESOLVERS

export type JournalsArgs = {};

// MUTATION RESOLVERS

export type CreateJournalArgs = {
    journalName: string;
};
