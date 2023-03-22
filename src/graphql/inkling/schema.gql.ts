import { TimestampTzPg } from "../../types/db.types";
import { SchemaFragment } from "../types/schema.types";

export default {
  Types: `
    type Inkling {
      timeId: DateTime!
      journalId: Int!
      text: String!
    }
  `,
  Query: `
    inklings(userId: Int!, journalId: Int!): [Inkling]
  `,
  Mutation: `
    commitInklings(userId: Int!, journalId: Int!, inklingText: [String]!): Boolean
  `,
} as SchemaFragment;

// QUERY RESOLVERS

export type InklingsArgs = {
  userId: number;
  journalId: number;
};

// MUTATION RESOLVERS

export type CommitInklingsArgs = {
  userId: number;
  journalId: number;
  inklingTexts: string[];
};

// TYPES

export type Inkling = {
  timeId: TimestampTzPg;
  journalId: number;
  text: string;
};
