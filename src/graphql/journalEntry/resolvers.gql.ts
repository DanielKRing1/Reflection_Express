import dummyData from "../dummyData";
import { Inkling } from "../inkling/schema.gql";
import { Journal } from "../journal/schema.gql";
import { ResolverFragment } from "../types/schema.types";
import { JournalEntry, ReflectionDecision, Thought } from "./schema.gql";

export default {
  Query: {
    journalEntries: (
      userId: number,
      journalId: number,
      cursorTime: number,
      count: number
    ): JournalEntry[] => {
      return (
        Object.values(dummyData.JournalEntries)
          // Same journal id
          .filter((je) => je.journalId === journalId)
          // Time cursor
          .filter((je) => je.timeId <= cursorTime)
          // Add userId
          .map((je) => ({
            userId: dummyData.Journals[je.journalId].userId,
            ...je,
          }))
          // Same userId
          .filter((je) => je.userId === userId)
          // Get most recent
          .sort((a, b) => a.timeId - b.timeId)
          .slice(0, count)
      );
    },
    thoughts: (
      userId: number,
      journalId: number,
      thoughtIds: number[]
    ): Thought[] => {
      const thoughtIdSet = new Set(thoughtIds);
      return Object.values(dummyData.Thoughts)
        .filter((t) => t.journalId === journalId)
        .filter((t) => thoughtIdSet.has(t.timeId))
        .map((t) => ({ userId: dummyData.Journals[t.journalId].userId, ...t }))
        .filter((t) => t.userId === userId);
    },
  },
  Mutation: {
    createJournalEntry: (
      userId: number,
      journalId: number,
      keepIds: number[],
      discardIds: number[]
    ): boolean => {
      try {
        /**
         * INSERT THOUGHT ROWS (from Inklings)
         * 
          INSERT INTO Thought (timeId, journalId, text)
          SELECT i.id, i.journalId, i.text
          FROM Inkling i
          WHERE i.journalId = <journalId> AND i.userId = <userId>
          
          INSERT INTO Thought (timeId, journalId, text)
          SELECT j.id, j.journalId, <text1>
          FROM Journal j
          WHERE j.id = <journalId1> AND j.userId = <userId1>
          UNION ALL
          SELECT j.id, j.journalId, <text2>
          FROM Journal j
          WHERE j.id = <journalId1> AND j.userId = <userId1>
          -- add more SELECT statements for additional comment data
          ;
          
          1. INSERT INKLINGS AS THOUGHTS
          2. DELETE INKLINGS
          3. CREATE JOURNALENTRY
          4. INSERT REFLECTION ROWS
          
          1.
          INSERT INTO Thought (timeId, journalId, text)
          SELECT i.timeId, i.journalId, i.text
          FROM Inkling i
          WHERE i.journalId = <journalId>
          AND EXISTS (
            SELECT 1 FROM Journal j
            WHERE j.id = <journalId> AND j.userId = <userId>
          )

          2.
          DELETE FROM Inkling
          WHERE journalId = <journalId>
          AND EXISTS (
            SELECT 1 FROM Journal j
            WHERE j.id = <journalId> AND j.userId = <userId>
          )
          RETURNING timeId;

          3.
          INSERT INTO JournalEntry (timeId, journalId)
          SELECT <timeId>, <journalId>
          WHERE EXISTS (
            SELECT 1
            FROM Journal j
            WHERE j.orderID = <journalId> AND j.userId = <userId>
          );

          4.
          INSERT INTO Reflection (timeId, journalId, thoughtId, journalEntryId, text, decision)
          SELECT <timeId>, j.id, t.timeId, je.timeId, t.text,
                CASE WHEN t.timeId IN (<thoughtIds1>) THEN 0
                      WHEN t.timeId IN (<thoughtIds2>) THEN 1
                      WHEN t.timeId IN (<thoughtIds3>) THEN 2
                      WHEN t.timeId IN (<thoughtIds4>) THEN 3
                      ELSE NULL END as decision
          FROM (VALUES (<thoughtId1>), (<thoughtId2>), ..., (<thoughtIdn>)) AS temp(timeId)
          JOIN Thought t ON t.timeId = temp.timeId
          JOIN JournalEntry je ON je.journalId = t.journalId
          JOIN Journal j ON j.id = je.journalId AND j.userId = <userId> AND j.id = <journalId>;

         */

        // 0. Ignore attempts to insert into a journal not owned by user
        const journal: Journal = dummyData.Journals[journalId];
        if (journal.userId !== userId)
          throw new Error(
            `createJournalEntry() received an invalid request to insert into journal ${journalId}, which does not correspond with user ${userId}`
          );

        // 1. Add Inklings to Thought table
        Object.values(dummyData.Inklings).forEach(
          (inkling: Inkling) => (dummyData.Thoughts[inkling.timeId] = inkling)
        );

        // 2. Clear Inklings
        const inklingIds: Set<number> = new Set(
          Object.values(dummyData.Inklings).map((i: Inkling) => i.timeId)
        );
        dummyData.Inklings = {};

        // 3. Create JournalEntry
        const keepThoughts: number[] = keepIds.filter(
          (id) => !inklingIds.has(id)
        );
        const keepInklings: number[] = keepIds.filter((id) =>
          inklingIds.has(id)
        );
        const discardThoughts: number[] = discardIds.filter(
          (id) => !inklingIds.has(id)
        );
        const discardInklings: number[] = discardIds.filter((id) =>
          inklingIds.has(id)
        );

        const id: number = Date.now();
        dummyData.JournalEntries[id] = {
          timeId: id,
          journalId: journalId,
          reflections: [
            ...keepThoughts.map((id) => ({
              thoughtId: id,
              decision: ReflectionDecision.KeepThought,
            })),
            ...keepInklings.map((id) => ({
              thoughtId: id,
              decision: ReflectionDecision.KeepInkling,
            })),
            ...discardThoughts.map((id) => ({
              thoughtId: id,
              decision: ReflectionDecision.DiscardThought,
            })),
            ...discardInklings.map((id) => ({
              thoughtId: id,
              decision: ReflectionDecision.DiscardInkling,
            })),
          ],
        };

        return true;
      } catch (err) {
        return false;
      }
    },
  },
} as ResolverFragment;
