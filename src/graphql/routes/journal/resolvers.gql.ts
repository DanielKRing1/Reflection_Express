import { Journal } from "@prisma/client";
import prisma from "../../../prisma/client";
import { ResolverFragment } from "../../types/schema.types";
import { CreateJournalArgs, JournalsArgs } from "./schema.gql";
import { getUserId } from "../../error/session";
import { createResolverError } from "../../error/catch";
import GqlContext from "../../types/context.types";

export default {
    Query: {
        journals: async (
            _: undefined,
            {}: JournalsArgs,
            contextValue: GqlContext,
            info: any
        ): Promise<Journal[]> => {
            try {
                const userId = getUserId(contextValue);

                // 1. Find all Journals that belong to userId
                const result = await prisma.journal.findMany({
                    where: {
                        userId,
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
        createJournal: async (
            _: undefined,
            { journalName }: CreateJournalArgs,
            contextValue: GqlContext,
            info: any
        ): Promise<Journal | null> => {
            try {
                const userId = getUserId(contextValue);

                // 1. Create Journal with autoincrement id
                const result = await prisma.journal.create({
                    data: {
                        userId,
                        name: journalName,
                    },
                });

                console.log(result);

                return result;
            } catch (err) {
                throw await await createResolverError(err, contextValue);
            }
        },
    },
} as ResolverFragment;
