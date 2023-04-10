import { SchemaFragment } from "../../types/schema.types";

export default {
    Types: `
    type Inkling {
      timeId: DateTime!
      journalId: Int!
      text: String!
    }
  `,
    Query: `
    inklings(userId: String!, journalId: Int!): [Inkling]
  `,
    Mutation: `
    commitInklings(userId: String!, journalId: Int!, inklingText: [String]!): Boolean
  `,
} as SchemaFragment;

// QUERY RESOLVERS

export type InklingsArgs = {
    journalId: number;
};

// MUTATION RESOLVERS

export type CommitInklingsArgs = {
    journalId: number;
    inklingTexts: string[];
};
