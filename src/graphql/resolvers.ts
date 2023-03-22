import DateScalarFragment from "./scalars/date.gql";

import InklingSchemaFragment from "./inkling/resolvers.gql";
import JournalEntrySchemaFragment from "./journalEntry/resolvers.gql";
import JournalSchemaFragment from "./journal/resolvers.gql";

export default {
  ...DateScalarFragment.Resolver,

  Query: {
    ...InklingSchemaFragment.Query,
    ...JournalEntrySchemaFragment.Query,
    ...JournalSchemaFragment.Query,
  },

  Mutation: {
    ...InklingSchemaFragment.Mutation,
    ...JournalEntrySchemaFragment.Mutation,
    ...JournalSchemaFragment.Mutation,
  },
};
