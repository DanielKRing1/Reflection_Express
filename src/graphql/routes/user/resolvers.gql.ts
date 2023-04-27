import GqlContext from "../../types/context.types";
import { ResolverFragment } from "../../types/schema.types";
import { UserArgs } from "./schema.gql";

import { User } from "@prisma/client";
import prisma from "../../../prisma/client";
import { createResolverError } from "../../error/catch";
import { getUserId } from "../../error/session";

const resolvers = {
    Query: {
        user: async (
            _: undefined,
            {}: UserArgs,
            contextValue: GqlContext,
            info: undefined
        ): Promise<User | null> => {
            try {
                const userId = getUserId(contextValue);

                const result = await prisma.user.findUniqueOrThrow({
                    where: {
                        email: userId,
                    },
                });

                console.log(result);

                return result;
            } catch (err) {
                throw createResolverError(err, contextValue);
            }
        },
    },
    Mutation: {},
} as ResolverFragment;

export default resolvers;
