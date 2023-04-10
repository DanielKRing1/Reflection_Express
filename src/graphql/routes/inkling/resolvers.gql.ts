import { Inkling, Journal } from "@prisma/client";
import prisma from "../../../prisma/client";

import { ResolverFragment } from "../../types/schema.types";
import { CommitInklingsArgs, InklingsArgs } from "./schema.gql";

export default {
    Query: {
        inklings: async (
            _: undefined,
            { journalId }: InklingsArgs,
            contextValue: any,
            info: any
        ): Promise<Inkling[]> => {
            try {
                const userId = contextValue.req.session.userId;

                // 1. Get Inklings whose journalId matches the provided journalId
                //      and whose provided userId owns the Journal
                const result = await prisma.inkling.findMany({
                    where: {
                        journalId: journalId,
                        inkling_journalId: {
                            userId: userId,
                        },
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
        commitInklings: async (
            _: undefined,
            { journalId, inklingTexts }: CommitInklingsArgs,
            contextValue: any,
            info: any
        ): Promise<boolean> => {
            try {
                const userId = contextValue.req.session.userId;

                await prisma.$transaction(async (prisma) => {
                    // 1. Get Journal
                    const journal: Journal =
                        await prisma.journal.findUniqueOrThrow({
                            where: {
                                id: journalId,
                            },
                        });

                    // 2. User does not own Journal
                    if (journal.userId !== userId)
                        throw new Error(
                            `commitInklings received a request to access Journal ${journalId}, which is not owned by User ${userId}`
                        );

                    // 3. Create Inklings
                    const baseTime = new Date();
                    const result = await prisma.inkling.createMany({
                        data: inklingTexts.map((text: string, i: number) => ({
                            timeId: new Date(baseTime.getTime() + i),
                            journalId,
                            text,
                        })),
                    });

                    console.log(result);
                });

                return true;
            } catch (err) {
                console.log(err);
            }

            return false;
        },
    },
} as ResolverFragment;
