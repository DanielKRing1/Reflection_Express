import { Inkling, Journal } from "@prisma/client";
import prisma from "../../../prisma/client";

import { ResolverFragment } from "../../types/schema.types";
import { CommitInklingsArgs, InklingsArgs } from "./schema.gql";
import { GraphQLError } from "graphql";
import { getUserId } from "../../error/session";
import { createResolverError } from "../../error/catch";
import GqlContext from "../../types/context.types";

export default {
    Query: {
        inklings: async (
            _: undefined,
            { journalId }: InklingsArgs,
            contextValue: GqlContext,
            info: any
        ): Promise<Inkling[]> => {
            try {
                const userId = getUserId(contextValue);

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
                throw createResolverError(err, contextValue);
            }
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
                const userId = getUserId(contextValue);

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
                        throw new GraphQLError(
                            `commitInklings received a request to access Journal ${journalId}, which is not owned by User ${userId}`,
                            {
                                extensions: {
                                    code: "UNAUTHENTICATED",
                                },
                            }
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
                throw createResolverError(err, contextValue);
            }
        },
    },
} as ResolverFragment;
