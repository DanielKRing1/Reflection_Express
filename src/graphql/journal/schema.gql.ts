import { SchemaFragment } from "../types/schema.types";

export default {
  Types: `
    type Journal {
      id: ID!
      name: String!
    }
  `,
  Query: `
    journals: [Journal]!
  `,
  Mutation: `
    createJournal(userId: ID!, journalId: ID!, journalName: String!): String!
  `,
} as SchemaFragment;
