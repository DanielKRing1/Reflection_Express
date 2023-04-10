import { TimestampTzPg } from "../../../types/db.types";
import { serializeDate } from "../../../utils/date";
import { ResolverFragment } from "../../types/schema.types";
import {
    CreateJournalEntryArgs,
    JournalEntriesArgs,
    ThoughtsArgs,
} from "./schema.gql";
import GqlContext from "../../types/context.types";
import prisma from "../../../prisma/client";
import { Journal, Thought } from "@prisma/client";

export default {
    Query: {
        journalEntries: async (
            _: undefined,
            {
                journalId,
                cursorTime = serializeDate(new Date()) as TimestampTzPg,
                count,
            }: JournalEntriesArgs,
            contextValue: any,
            info: any
        ): Promise<Journal[]> => {
            try {
                const userId = contextValue.req.session.userId;

                const result: Journal[] = await prisma.$queryRaw`
                    BEGIN;
                    
                    -- 1. Confirm "User" owns "JournalId" 
                    IF NOT EXISTS (SELECT 1 FROM ${process.env.DATABASE_SCHEMA}."Journal" WHERE id = ${journalId} AND userId = ${userId}) THEN
                        RAISE EXCEPTION 'Row with journalId=% and userId=% not found', ${journalId}, ${userId};
                        ROLLBACK;
                    END IF;

                    -- Select Journal
                    SELECT * FROM
                      (
                        SELECT * FROM ${process.env.DATABASE_SCHEMA}."Journal"
                        WHERE "id" = ${journalId}
                      ) j
                    -- Join JournalEntry
                    JOIN ${process.env.DATABASE_SCHEMA}."JournalEntry" je
                      ON je."journalId" = j."id"
                    -- Join Reflections
                    JOIN (
                      SELECT * FROM ${process.env.DATABASE_SCHEMA}."Reflection"
                        -- at or older than 'cursorTime'
                        WHERE "timeId" >= ${cursorTime}
                        -- Limit to 'count'
                        ORDER BY "timeId" DESC
                        LIMIT ${count}
                    ) r
                      ON r."journalEntryId" = je."timeId"
                    -- Join Thoughts
                    JOIN ${process.env.DATABASE_SCHEMA}."Thought" t
                      ON t."timeId" = r."thoughtId"
                    ORDER BY r."timeId" DESC;

                    COMMIT;`;

                console.log(result);

                return result;
            } catch (err) {
                console.log(err);
            }

            return [];
        },
        thoughts: async (
            _: undefined,
            { journalId, thoughtIds }: ThoughtsArgs,
            contextValue: any,
            info: any
        ): Promise<Thought[]> => {
            try {
                const userId = contextValue.req.session.userId;

                const thoughtDateIds = thoughtIds.map(
                    (id: TimestampTzPg) => new Date(id)
                );

                // 1. Get Journal and join with Thoughts
                const result = await prisma.thought.findMany({
                    where: {
                        journalId: journalId,
                        thought_journalId: {
                            userId,
                        },
                        timeId: {
                            in: thoughtDateIds,
                        },
                    },
                });

                console.log(result);

                return result;
            } catch (err) {
                console.log(err);
            }

            // const result1: number = await prisma.$executeRaw`
            // BEGIN;

            // -- 1. Confirm "User" owns "JournalId"
            // IF NOT EXISTS (SELECT 1 FROM ${
            //     process.env.DATABASE_SCHEMA
            // }."Journal" WHERE id = ${journalId} AND userId = ${userId}) THEN
            //     RAISE EXCEPTION 'Row with journalId=% and userId=% not found', ${journalId}, ${userId};
            //     ROLLBACK;
            // END IF;

            // SELECT * FROM
            //   (
            //     SELECT * FROM ${process.env.DATABASE_SCHEMA}."Thought"
            //     WHERE "journalId" = ${journalId}
            //     AND "timeId" = ANY('{${thoughtIds.join()}}')
            //   ) t
            // JOIN ${process.env.DATABASE_SCHEMA}."Journal" j
            //   ON j."id" = t."journalId"
            //   AND j."userId" = ${userId};

            // COMMIT;`;

            return [];
        },
    },
    Mutation: {
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
        ): Promise<boolean> => {
            try {
                const userId = contextValue.req.session.userId;

                const journalEntryId: string = serializeDate(new Date());

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

                const result: number = await prisma.$executeRaw`
                    BEGIN;
                    
                    -- 1. Confirm "User" owns "JournalId" 
                    IF NOT EXISTS (SELECT 1 FROM ${
                        process.env.DATABASE_SCHEMA
                    }."Journal" WHERE id = ${journalId} AND userId = ${userId}) THEN
                        RAISE EXCEPTION 'Row with journalId=% and userId=% not found', ${journalId}, ${userId};
                        ROLLBACK;
                    END IF;
                            
                    WITH
                        -- 2. Delete Inklings
                        "deletedInklings" AS (DELETE FROM ${
                            process.env.DATABASE_SCHEMA
                        }."Inkling" WHERE "journalId" = ${journalId} RETURNING *)
                        -- 3. Insert deleted Inklings into Thoughts
                        INSERT INTO ${
                            process.env.DATABASE_SCHEMA
                        }."Thought" ("timeId", "journalId", text) SELECT * FROM "deletedInklings";
                    
                    -- 4. Create new JournalEntry
                    INSERT INTO ${
                        process.env.DATABASE_SCHEMA
                    }."JournalEntry" ("timeId", "journalId") values (${journalEntryId}, ${journalId});

                    -- 4. Create and Insert Reflections
                    INSERT INTO ${
                        process.env.DATABASE_SCHEMA
                    }."Reflection" ("journalId", "thoughtId", "journalEntryId", decision)
                    SELECT ${journalId}, t."timeId", ${journalEntryId},
                        CASE WHEN t."timeId" = ANY('{${discardIdsThought.join()}}') THEN 0
                        WHEN t."timeId" = ANY('{${keepIdsThought.join()}}') THEN 1
                        WHEN t."timeId" = ANY('{${keepIdsInkling.join()}}') THEN 2
                        WHEN t."timeId" = ANY('{${discardIdsInkling.join()}}') THEN 3
                        ELSE NULL END as decision
                    FROM ${
                        process.env.DATABASE_SCHEMA
                    }."Thought" t ON t."timeId" = ANY('{${[
                    ...discardIdsThought,
                    ...keepIdsThought,
                    ...keepIdsInkling,
                    ...discardIdsInkling,
                ].join()}}')
                    AND t."journalId" = ${journalId};
                    
                    COMMIT;`;

                console.log(`Prisma raw query result: ${result}`);

                return true;
            } catch (err) {
                console.log(err);
                return false;
            }
        },
    },
} as ResolverFragment;
