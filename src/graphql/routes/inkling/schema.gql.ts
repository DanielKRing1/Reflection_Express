import { SchemaFragment } from "../../types/schema.types";

export default {
    Types: `
    type Inkling {
      timeId: DateTime!
      journalId: BigInt!
      text: String!
    }
  `,
    Query: `
    inklings(journalId: BigInt!): [Inkling]
  `,
    Mutation: `
    commitInklings(journalId: BigInt!, inklingTexts: [String]!): Boolean!
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
