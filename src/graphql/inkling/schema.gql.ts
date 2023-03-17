import { SchemaFragment } from "../types/schema.types";

export default {
  Types: `
    type Inkling {
      timeId: Int!
      journalId: Int!
      text: String!
    }
  `,
  Query: `
    inklings: [Inkling]
  `,
  Mutation: `
    commitInklings(userId: Int!, journalId: Int!, inklings: [Inkling]!): Boolean
  `,
} as SchemaFragment;

export type Inkling = {
  timeId: number;
  journalId: number;
  text: string;
};
