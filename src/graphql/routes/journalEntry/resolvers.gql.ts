import { TimestampTzPg } from "../../../types/db.types";
import { serializeDate } from "../../../utils/date";
import { ResolverFragment } from "../../types/schema.types";
import {
    CreateJournalEntryArgs,
    JournalEntriesArgs,
    JournalEntryWReflection,
    ThoughtsArgs,
} from "./schema.gql";
import GqlContext from "../../types/context.types";
import prisma from "../../../prisma/client";
import { Prisma, Reflection, Thought } from "@prisma/client";
import { Dict } from "../../../types/global.types";
import { getUserId } from "../../error/session";
import { createResolverError } from "../../error/catch";

export default {
    Query: {
        journalEntries: async (
            _: undefined,
            { journalId, cursorTime = new Date(), count }: JournalEntriesArgs,
            contextValue: GqlContext,
            info: any
        ): Promise<JournalEntryWReflection[]> => {
            try {
                const userId = getUserId(contextValue);

                // 1. Confirm "User" owns "JournalId"
                await prisma.journal.findFirstOrThrow({
                    where: {
                        userId,
                        id: journalId,
                    },
                });

                const result: Reflection[] = await prisma.$queryRaw`
                    -- Select Journal Entries
                    SELECT je."timeId" as "journalEntryId", t."timeId" as "thoughtId", r."decision" FROM
                    (
                        SELECT * FROM
                        "JournalEntry" AS je
                        WHERE je."journalId" = ${journalId}
                        -- older than 'cursorTime'
                        AND "timeId" < ${cursorTime}
                        -- Limit to 'count'
                        ORDER BY "timeId" DESC
                        LIMIT ${count}
                    ) AS je
                    -- Join Reflections
                    JOIN (
                      SELECT * FROM "Reflection"
                        -- older than 'cursorTime'
                        WHERE "journalEntryId" < ${cursorTime}
                    ) r
                      ON r."journalEntryId" = je."timeId"
                    -- Join Thoughts
                    JOIN "Thought" t
                      ON t."timeId" = r."thoughtId"
                    ORDER BY r."journalEntryId" DESC;`;

                const reflectionGroups: Dict<Reflection[]> = result.reduce<
                    Dict<Reflection[]>
                >((acc: Dict<Reflection[]>, cur: Reflection) => {
                    if (
                        acc[cur.journalEntryId as unknown as string] ===
                        undefined
                    )
                        acc[cur.journalEntryId as unknown as string] = [];
                    acc[cur.journalEntryId as unknown as string].push(cur);

                    return acc;
                }, {});

                const journalEntries: JournalEntryWReflection[] = Object.keys(
                    reflectionGroups
                )
                    .sort((a, b) => (a < b ? 1 : -1))
                    .reduce<JournalEntryWReflection[]>(
                        (acc: JournalEntryWReflection[], key: any) => {
                            acc.push({
                                timeId: reflectionGroups[key][0].journalEntryId,
                                journalId,
                                reflections: reflectionGroups[key],
                            });

                            return acc;
                        },
                        []
                    );

                return journalEntries;
            } catch (err) {
                throw await createResolverError(err, contextValue);
            }
        },
        thoughts: async (
            _: undefined,
            { journalId, thoughtIds }: ThoughtsArgs,
            contextValue: GqlContext,
            info: any
        ): Promise<Thought[]> => {
            try {
                const userId = getUserId(contextValue);

                // Rm duplicates
                thoughtIds = Array.from(new Set(thoughtIds));
                const thoughtDateIds = thoughtIds.map(
                    (id: TimestampTzPg) => new Date(id)
                );

                // 1. Get Journal and join with Thoughts
                const result = await prisma.thought.findMany({
                    where: {
                        journalId: BigInt(journalId),
                        thought_journalId: {
                            userId,
                        },
                        timeId: {
                            in: thoughtDateIds,
                        },
                    },
                });

                return result;
            } catch (err) {
                throw await createResolverError(err, contextValue);
            }
        },
    },
    Mutation: {
        // Returns empty Reflections every time
        createJournalEntry: async (
            _: undefined,
            {
                journalId,
                discardIdsThought,
                keepIdsThought,
                keepIdsInkling,
                discardIdsInkling,
            }: CreateJournalEntryArgs,
            contextValue: GqlContext,
            info: any
        ): Promise<JournalEntryWReflection | null> => {
            try {
                const userId = getUserId(contextValue);

                const timestamp: Date = new Date();
                const journalEntryId: string = serializeDate(timestamp);

                // Transaction: Do not convert Inklings to Thoughts unless this entire query succeeds
                // await prisma.$transaction(async (prisma) => {
                //     await prisma.inkling.deleteMany({
                //         where: {
                //             journalId,
                //             inkling_journalId: {
                //                 userId,
                //             },
                //         },
                //        // Cannot return deleted rows
                //         returning: true
                //     });

                //     await prisma.reflection.findMany({
                //         where: {
                //             journalId,
                //             reflection_journalId: {
                //                 userId,
                //             },
                //         },
                //     });
                // });

                // 1. Confirm "User" owns "JournalId"
                await prisma.journal.findFirstOrThrow({
                    where: {
                        userId,
                        id: journalId,
                    },
                });

                const executeResult1: number = await prisma.$executeRaw`
                    WITH
                        -- 1. Delete Inklings
                        "deletedInklings" AS (DELETE FROM "Inkling" WHERE "journalId" = ${journalId} RETURNING *),
                        -- 2. Insert deleted Inklings into Thoughts
                        "a" AS (INSERT INTO "Thought" ("timeId", "journalId", text) SELECT * FROM "deletedInklings")
                    
                        -- 3. Create new JournalEntry
                    INSERT INTO "JournalEntry" ("timeId", "journalId") values (${journalEntryId}::timestamptz, ${journalId})`;

                const executeResult2: number = await prisma.$executeRaw`
                -- 4. Create and Insert Reflections
                INSERT INTO "Reflection" ("journalId", "thoughtId", "journalEntryId", decision)
                        SELECT ${journalId}, t."timeId", ${journalEntryId}::timestamptz,
                            CASE
                                WHEN t."timeId" = ANY(ARRAY[${Prisma.join(
                                    discardIdsThought.length === 0
                                        ? [null]
                                        : discardIdsThought
                                )}]::timestamptz[]) THEN 0
                                WHEN t."timeId" = ANY(ARRAY[${Prisma.join(
                                    keepIdsThought.length === 0
                                        ? [null]
                                        : keepIdsThought
                                )}]::timestamptz[]) THEN 1
                                WHEN t."timeId" = ANY(ARRAY[${Prisma.join(
                                    keepIdsInkling.length === 0
                                        ? [null]
                                        : keepIdsInkling
                                )}]::timestamptz[]) THEN 2
                                WHEN t."timeId" = ANY(ARRAY[${Prisma.join(
                                    discardIdsInkling.length === 0
                                        ? [null]
                                        : discardIdsInkling
                                )}]::timestamptz[]) THEN 3
                            ELSE NULL END as decision
                        FROM "Thought" t
                        WHERE t."timeId" = ANY(ARRAY[${Prisma.join([
                            ...discardIdsThought,
                            ...keepIdsThought,
                            ...keepIdsInkling,
                            ...discardIdsInkling,
                        ])}]::timestamptz[])
                        AND t."journalId" = ${journalId};`;

                return {
                    timeId: timestamp,
                    journalId,
                    reflections: [],
                };
            } catch (err) {
                throw await createResolverError(err, contextValue);
            }
        },
    },
} as ResolverFragment;
