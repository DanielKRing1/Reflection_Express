import { SchemaFragment } from "../../types/schema.types";

export default {
    // 'id' is type BigInt in database
    //    This returns with the postfix 'n', which GraphQL treats as a string
    //    So convert BigInt to string in js code
    //    and keep it as BigInt in Database
    Types: `
    type Journal {
      id: BigInt!
      userId: String!
      name: String!
    }
  `,
    Query: `
    journals: [Journal]!
  `,
    Mutation: `
    createJournal(journalName: String!): Boolean!
  `,
} as SchemaFragment;

// QUERY RESOLVERS

export type JournalsArgs = {};

// MUTATION RESOLVERS

export type CreateJournalArgs = {
    journalName: string;
};
