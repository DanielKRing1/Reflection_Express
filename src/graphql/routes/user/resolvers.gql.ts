import GqlContext from "../../types/context.types";
import { ResolverFragment } from "../../types/schema.types";
import { UpdateLastUsedJournalIdArgs, UserArgs } from "./schema.gql";

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
                throw await createResolverError(err, contextValue);
            }
        },
    },
    Mutation: {
        updateLastUsedJournalId: async (
            _: undefined,
            { journalId }: UpdateLastUsedJournalIdArgs,
            contextValue: GqlContext,
            info: any
        ): Promise<boolean> => {
            try {
                const userId = getUserId(contextValue);

                // 1. Create Journal with autoincrement id
                const result = await prisma.user.update({
                    where: {
                        email: userId,
                    },
                    data: {
                        lastUsedJId: journalId,
                    },
                });

                console.log(result);

                return true;
            } catch (err) {
                throw await createResolverError(err, contextValue);
            }
        },
    },
} as ResolverFragment;

export default resolvers;
