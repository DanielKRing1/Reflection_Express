import DateScalarFragment from "./scalars/date.gql";

import InklingSchemaFragment from "./routes/inkling/resolvers.gql";
import JournalEntrySchemaFragment from "./routes/journalEntry/resolvers.gql";
import JournalSchemaFragment from "./routes/journal/resolvers.gql";

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
