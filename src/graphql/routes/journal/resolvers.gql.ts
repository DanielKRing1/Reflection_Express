import { Journal } from "@prisma/client";
import prisma from "../../../prisma/client";
import { ResolverFragment } from "../../types/schema.types";
import { CreateJournalArgs, JournalsArgs } from "./schema.gql";

export default {
    Query: {
        journals: async (
            _: undefined,
            {}: JournalsArgs,
            contextValue: any,
            info: any
        ): Promise<Journal[]> => {
            try {
                const userId = contextValue.req.session.userId;

                // 1. Find all Journals that belong to userId
                const result = await prisma.journal.findMany({
                    where: {
                        userId,
                    },
                });

                console.log(result);

                return result;
            } catch (err) {
                console.log(err);
            }

            return [];
        },
    },
    Mutation: {
        createJournal: async (
            _: undefined,
            { journalName }: CreateJournalArgs,
            contextValue: any,
            info: any
        ): Promise<boolean> => {
            try {
                const userId = contextValue.req.session.userId;

                // 1. Create Journal with autoincrement id
                const result = await prisma.journal.create({
                    data: {
                        userId,
                        name: journalName,
                    },
                });

                console.log(result);

                return true;
            } catch (err) {
                console.log(err);
            }

            return false;
        },
    },
} as ResolverFragment;
