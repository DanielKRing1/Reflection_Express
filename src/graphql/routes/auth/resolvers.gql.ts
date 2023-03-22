import dummyData from "../../dummyData";
import GqlContext from "../../types/context.types";
import { ResolverFragment } from "../../types/schema.types";
import { UserArgs, CreateUserArgs, LoginArgs, User } from "./schema.gql";

export default {
  Query: {
    user: (
      _: undefined,
      { email }: UserArgs,
      contextValue: GqlContext,
      info: undefined
    ): User => {
      return dummyData.Users[email] || null;
    },
  },
  Mutation: {
    createUser: (
      _: undefined,
      { email, password }: CreateUserArgs,
      contextValue: GqlContext,
      info: undefined
    ): boolean => {
      try {
        if (dummyData.Users[email] !== undefined)
          throw new Error(
            `createUser() received an invalid request to create a user that already exists ${email}`
          );

        // 1. Create User
        const name: string = new Date().toISOString();
        dummyData.Users[email] = {
          name,
          email,
          lastUsedJId: null,
        };

        // 2. Create Password
        dummyData.Passwords[email] = {
          userId: email,
          passwordHash: email,
        };

        return true;
      } catch (err) {
        return false;
      }
    },
    login: (
      _: undefined,
      { email, password }: CreateUserArgs,
      contextValue: GqlContext,
      info: undefined
    ): boolean => {
      try {
        if (dummyData.Users[email] !== undefined)
          throw new Error(
            `createUser() received an invalid request to create a user that already exists ${email}`
          );

        // 1. Create User
        const name: string = new Date().toISOString();
        dummyData.Users[email] = {
          name,
          email,
          lastUsedJId: null,
        };

        // 2. Create Password
        dummyData.Passwords[email] = {
          userId: email,
          passwordHash: email,
        };

        return true;
      } catch (err) {
        return false;
      }
    },
  },
} as ResolverFragment;
