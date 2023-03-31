import dummyData from "../../dummyData";
import GqlContext from "../../types/context.types";
import { ResolverFragment } from "../../types/schema.types";
import { UserArgs, CreateUserArgs, LoginArgs, User } from "./schema.gql";

import compare from "../../../auth/password/compare";

const resolvers = {
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
    createUser: async (
      _: undefined,
      { email, password }: CreateUserArgs,
      contextValue: GqlContext,
      info: undefined
    ): Promise<boolean> => {
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

        return await resolvers.Mutation.login(
          _,
          { email, password },
          contextValue,
          info
        );
      } catch (err) {
        return false;
      }
    },
    login: async (
      _: undefined,
      { email, password }: CreateUserArgs,
      contextValue: GqlContext,
      info: undefined
    ): Promise<boolean> => {
      try {
        if (dummyData.Users[email] !== undefined)
          throw new Error(
            `createUser() received an invalid request to create a user that already exists ${email}`
          );

        // 1. Get user password hash
        const hash: string = dummyData.Passwords[email].passwordHash;

        // 2. Authenticate password
        const isAuthentic: boolean = await compare(password, hash);

        // 3. Create session for user

        return true;
      } catch (err) {
        return false;
      }
    },
  },
} as ResolverFragment;

export default resolvers;
