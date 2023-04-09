import { SchemaFragment } from "../../types/schema.types";

// OPERATION NAMES

const USER_QUERY_NAME = "User";
const CREATE_USER_MUTATION_NAME = "createUser";
const LOGIN_MUTATION_NAME = "login";

// OPERSATION NAMES SET

// To be used in express auth middleware
//    to prevent auth checks for these gql operation names
export const AUTH_OP_NAMES: Set<string> = new Set([
    USER_QUERY_NAME.toLocaleLowerCase(),
    CREATE_USER_MUTATION_NAME.toLocaleLowerCase(),
    LOGIN_MUTATION_NAME.toLocaleLowerCase(),
]);

export default {
    Types: `
    type User {
      name: String!
      email: String!
      lastUsedJId: String!
    }
  `,
    Query: `
    ${USER_QUERY_NAME}(email: String!): User
  `,
    Mutation: ``,
} as SchemaFragment;

// QUERY RESOLVERS

export type UserArgs = {
    email: string;
};

// MUTATION RESOLVERS

export type CreateUserArgs = {
    email: string;
    password: string;
};

export type LoginArgs = {
    email: string;
    password: string;
};

// TYPES

export type User = {
    name: string;
    email: string;
    lastUsedJId: string | null;
};

export type Password = {
    userId: string;
    passwordHash: string;
};
