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
                        journalId: BigInt(journalId),
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
        ): Promise<Inkling[]> => {
            try {
                // User id
                const userId = contextValue.req.session.userId;

                // Return data
                let inklings: Inkling[] = [];

                await prisma.$transaction(async (prisma) => {
                    // 1. Get Journal
                    const journal: Journal =
                        await prisma.journal.findUniqueOrThrow({
                            where: {
                                id: BigInt(journalId),
                            },
                        });

                    // 2. User does not own Journal
                    if (journal.userId !== userId)
                        throw new Error(
                            `commitInklings received a request to access Journal ${journalId}, which is not owned by User ${userId}`
                        );

                    // 3. Create Inklings
                    const baseTime = new Date();
                    inklings = inklingTexts.map((text: string, i: number) => ({
                        timeId: new Date(baseTime.getTime() + i),
                        journalId: BigInt(journalId),
                        text,
                    }));
                    const result = await prisma.inkling.createMany({
                        data: inklings,
                    });

                    console.log(result);
                });

                return inklings;
            } catch (err) {
                console.log(err);
            }

            return [];
        },
    },
} as ResolverFragment;
