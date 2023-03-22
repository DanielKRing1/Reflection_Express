import DateScalarFragment from "./scalars/date.gql";

import InklingSchemaFragment from "./routes/inkling/schema.gql";
import JournalEntrySchemaFragment from "./routes/journalEntry/schema.gql";
import JournalSchemaFragment from "./routes/journal/schema.gql";

export default `
    ${DateScalarFragment.Schema}

    ${InklingSchemaFragment.Types}
    ${JournalEntrySchemaFragment.Types}
    ${JournalSchemaFragment.Types}

    type Query {
        ${InklingSchemaFragment.Query}
        ${JournalEntrySchemaFragment.Query}
        ${JournalSchemaFragment.Query}
    }

    type Mutation {
        ${InklingSchemaFragment.Mutation}
        ${JournalEntrySchemaFragment.Mutation}
        ${JournalSchemaFragment.Mutation}
    }
`;
