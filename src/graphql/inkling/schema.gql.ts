import { SchemaFragment } from "../types/schema.types";

export default {
  Types: `
    type Inkling {
      timeId: String!
      userId: ID!
      journalId: ID!
      text: String!
    }
  `,
  Query: `
    inklings: [Inkling]
  `,
  Mutation: `
    commitInklings(userId: String!, journalId: String!, inklings: [Inkling]!): Boolean
  `,
} as SchemaFragment;
