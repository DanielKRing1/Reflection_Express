import { Journal } from "@prisma/client";
import prisma from "../../../prisma/client";
import { ResolverFragment } from "../../types/schema.types";
import {
    CreateJournalArgs,
    EditJournalArgs,
    JournalsArgs,
    RmJournalArgs,
} from "./schema.gql";
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
                throw await createResolverError(err, contextValue);
            }
        },
        editJournal: async (
            _: undefined,
            { journalId, journalEdits }: EditJournalArgs,
            contextValue: GqlContext,
            info: any
        ): Promise<Journal | null> => {
            try {
                const userId = getUserId(contextValue);

                // 1. Edit Journal, only if journal id belongs to userId
                const result = await prisma.journal.update({
                    where: {
                        userId,
                        id: journalId,
                    },
                    data: journalEdits,
                });

                console.log(result);

                return result;
            } catch (err) {
                throw await createResolverError(err, contextValue);
            }
        },
        rmJournal: async (
            _: undefined,
            { journalId }: RmJournalArgs,
            contextValue: GqlContext,
            info: any
        ): Promise<boolean> => {
            try {
                const userId = getUserId(contextValue);

                // 1. Delete Journal, only if id belongs to userId
                const result = await prisma.journal.delete({
                    where: {
                        userId,
                        id: journalId,
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
