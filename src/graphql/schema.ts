import DateScalarFragment from "./scalars/date.gql";

import UserSchemaFragment from "./routes/user/schema.gql";
import InklingSchemaFragment from "./routes/inkling/schema.gql";
import JournalEntrySchemaFragment from "./routes/journalEntry/schema.gql";
import JournalSchemaFragment from "./routes/journal/schema.gql";

export default `
    ${DateScalarFragment.Schema}

    ${UserSchemaFragment.Types}
    ${InklingSchemaFragment.Types}
    ${JournalEntrySchemaFragment.Types}
    ${JournalSchemaFragment.Types}

    type Query {
        ${UserSchemaFragment.Query}
        ${InklingSchemaFragment.Query}
        ${JournalEntrySchemaFragment.Query}
        ${JournalSchemaFragment.Query}
    }

    type Mutation {
        ${UserSchemaFragment.Mutation}
        ${InklingSchemaFragment.Mutation}
        ${JournalEntrySchemaFragment.Mutation}
        ${JournalSchemaFragment.Mutation}
    }
`;
