import dummyData from "../../dummyData";
import GqlContext from "../../types/context.types";
import { ResolverFragment } from "../../types/schema.types";
import { UserArgs, CreateUserArgs } from "./schema.gql";

import compare from "../../../auth/password/compare";
import prisma from "../../../prisma/client";
import { User } from "@prisma/client";

const resolvers = {
    Query: {
        user: (
            _: undefined,
            { email }: UserArgs,
            contextValue: GqlContext,
            info: undefined
        ): User | null => {
            return dummyData.Users[email] || null;
        },
    },
    Mutation: {},
} as ResolverFragment;

export default resolvers;
