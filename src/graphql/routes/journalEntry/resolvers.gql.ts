import { TimestampTzPg } from "../../../types/db.types";
import { serializeDate } from "../../../utils/date";
import dummyData from "../../dummyData";
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
        journalEntries: (
            _: undefined,
            {
                userId,
                journalId,
                cursorTime = new Date().toISOString() as TimestampTzPg,
                count,
            }: JournalEntriesArgs,
            contextValue: any,
            info: any
        ): Journal[] => {
            // console.log(dummyData.JournalEntries);
            // return (
            //     Object.values(dummyData.JournalEntries)
            //         // Same journal id
            //         .filter((je) => je.journalId === journalId)
            //         // Time cursor
            //         .filter(
            //             (je) =>
            //                 new Date(je.timeId).getTime() <=
            //                 new Date(cursorTime).getTime()
            //         )
            //         // Add userId
            //         .map((je) => ({
            //             userId: dummyData.Journals[je.journalId].userId,
            //             ...je,
            //         }))
            //         // Same userId
            //         .filter((je) => je.userId === userId)
            //         // Get most recent
            //         .sort(
            //             (a, b) =>
            //                 new Date(a.timeId).getTime() -
            //                 new Date(b.timeId).getTime()
            //         )
            //         .slice(0, count)
            // );

            return [];
        },
        thoughts: (
            _: undefined,
            { userId, journalId, thoughtIds }: ThoughtsArgs,
            contextValue: any,
            info: any
        ): Thought[] => {
            // const thoughtIdSet = new Set(thoughtIds);
            // return Object.values(dummyData.Thoughts)
            //     .filter((t) => t.journalId === journalId)
            //     .filter((t) => thoughtIdSet.has(t.timeId))
            //     .map((t) => ({
            //         userId: dummyData.Journals[t.journalId].userId,
            //         ...t,
            //     }))
            //     .filter((t) => t.userId === userId);

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
                const result: number = await prisma.$executeRaw`
                    BEGIN;
                    
                    -- 1. Confirm "User" owns "JournalId" 
                    IF NOT EXISTS (SELECT 1 FROM Journal WHERE id = ${journalId} AND userId = ${userId}) THEN
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

                    -- 4. Create and Insert Reflection
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
