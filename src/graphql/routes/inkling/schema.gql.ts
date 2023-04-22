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
    inklings(journalId: BigInt!): [Inkling]!
  `,
    Mutation: `
    commitInklings(journalId: BigInt!, inklingTexts: [String]!): [Inkling]!
  `,
} as SchemaFragment;

// QUERY RESOLVERS

export type InklingsArgs = {
    journalId: bigint;
};

// MUTATION RESOLVERS

export type CommitInklingsArgs = {
    journalId: bigint;
    inklingTexts: string[];
};
