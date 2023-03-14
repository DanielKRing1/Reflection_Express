import InklingSchemaFragment from "./inkling/schema.gql";
import JournalEntrySchemaFragment from "./journalEntry/schema.gql";
import JournalSchemaFragment from "./journal/schema.gql";

export default `
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

    schema {
        query: Query
        mutation: Mutation
    }
`;
