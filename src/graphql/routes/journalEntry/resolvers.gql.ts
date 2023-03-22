import { TimestampTzPg } from "../../../types/db.types";
import { serializeDate } from "../../../utils/date";
import dummyData from "../../dummyData";
import { Inkling } from "../inkling/schema.gql";
import { Journal } from "../journal/schema.gql";
import { ResolverFragment } from "../../types/schema.types";
import {
  CreateJournalEntryArgs,
  JournalEntriesArgs,
  JournalEntry,
  ReflectionDecision,
  Thought,
  ThoughtsArgs,
} from "./schema.gql";

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
    ): JournalEntry[] => {
      console.log(dummyData.JournalEntries);

      return (
        Object.values(dummyData.JournalEntries)
          // Same journal id
          .filter((je) => je.journalId === journalId)
          // Time cursor
          .filter(
            (je) =>
              new Date(je.timeId).getTime() <= new Date(cursorTime).getTime()
          )
          // Add userId
          .map((je) => ({
            userId: dummyData.Journals[je.journalId].userId,
            ...je,
          }))
          // Same userId
          .filter((je) => je.userId === userId)
          // Get most recent
          .sort(
            (a, b) =>
              new Date(a.timeId).getTime() - new Date(b.timeId).getTime()
          )
          .slice(0, count)
      );
    },
    thoughts: (
      _: undefined,
      { userId, journalId, thoughtIds }: ThoughtsArgs,
      contextValue: any,
      info: any
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
      _: undefined,
      { userId, journalId, keepIds, discardIds }: CreateJournalEntryArgs,
      contextValue: any,
      info: any
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
          5. GET REFLECTION ROWS
          
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

          4. Version 1
          INSERT INTO Reflection (journalId, thoughtId, journalEntryId, decision)
          SELECT j.id, t.timeId, <jeTimeId>,
                CASE WHEN t.timeId IN (<thoughtIds1>) THEN 0
                      WHEN t.timeId IN (<thoughtIds2>) THEN 1
                      WHEN t.timeId IN (<thoughtIds3>) THEN 2
                      WHEN t.timeId IN (<thoughtIds4>) THEN 3
                      ELSE NULL END as decision
          FROM (VALUES (<thoughtId1>), (<thoughtId2>), ..., (<thoughtIdn>)) AS temp(timeId)
          JOIN Thought t ON t.timeId = temp.timeId AND t.journalId = <journalId>
          JOIN JournalEntry je ON je.journalId = t.journalId
          JOIN Journal j ON j.id = je.journalId AND j.userId = <userId> AND j.id = <journalId>;

          4. Version 2
INSERT INTO Reflection (journalId, thoughtId, journalEntryId, decision)
SELECT j.id, t.timeId, <jeTimeId>,
       CASE WHEN t.timeId IN (<thoughtIds1>) THEN 0
            WHEN t.timeId IN (<thoughtIds2>) THEN 1
            WHEN t.timeId IN (<thoughtIds3>) THEN 2
            WHEN t.timeId IN (<thoughtIds4>) THEN 3
            ELSE NULL END as decision
FROM 
(
  SELECT *
  FROM Journal
  WHERE id = <journalId> AND userId = <userId>
) j
JOIN JournalEntry je ON je.journalId = j.id
JOIN (
  SELECT *
  FROM (
    VALUES (<thoughtId1>), (<thoughtId2>), ..., (<thoughtIdn>)
  ) AS temp(timeId)
  JOIN Thought t ON t.id = temp.id
) AS temp_thought ON temp_thought.journalId = j.id

          4. Version 3
BEGIN;

DECLARE @journalEntryId int;

IF NOT EXISTS (SELECT 1 FROM Journal WHERE id = <journalId> AND userId = <userId>) THEN
    RAISE EXCEPTION 'Row with journalId=% and userId=% not found', <journalId>, <userId>;
    ROLLBACK;
END IF;

-- Insert a new journal entry
INSERT INTO JournalEntry (journalId, timeId)
VALUES (<journalId>, NOW())
RETURNING timeId INTO @journalEntryId;

-- Bulk Insert Reflection rows
INSERT INTO Reflection (journalId, thoughtId, @journalEntryId, decision)
SELECT j.id, temp_thought.timeId, @journalEntryId,
       CASE WHEN temp_thought.timeId IN (<thoughtIds1>) THEN 0
            WHEN temp_thought.timeId IN (<thoughtIds2>) THEN 1
            WHEN temp_thought.timeId IN (<thoughtIds3>) THEN 2
            WHEN temp_thought.timeId IN (<thoughtIds4>) THEN 3
            ELSE NULL END as decision
FROM (
  SELECT *
  FROM Journal
  WHERE id = <journalId> AND userId = <userId>
) j
JOIN (
  SELECT *
  FROM (
    VALUES (<thoughtId1>), (<thoughtId2>), ..., (<thoughtIdn>)
  ) AS temp(timeId)
  JOIN Thought t ON t.id = temp.id
) AS temp_thought ON temp_thought.journalId = j.id
WHERE j.id = <journalId>;

COMMIT;

-- Insert a new journal entry
INSERT INTO JournalEntry (journalId, timeId)
VALUES (<journalId>, NOW())

          5.
          SELECT *
          FROM (
            SELECT *
            FROM JournalEntry je
            JOIN Journal j ON j.id = je.journalId AND j.id = <journalId> AND j.userId = <userId> AND je.timeId <= <timestamp> 
            LIMIT <10>
          ) subq
          JOIN Reflection r ON r.journalEntryId = subq.timeId
          JOIN Thought t ON t.timeId = r.thoughtId
         */

        // 0. Ignore attempts to insert into a journal not owned by user
        const journal: Journal = dummyData.Journals[journalId];
        // console.log(journal.userId);
        // console.log(userId);
        if (journal.userId !== userId)
          throw new Error(
            `createJournalEntry() received an invalid request to insert into journal ${journalId}, which does not correspond with user ${userId}`
          );

        // 1. Add Inklings to Thought table
        Object.values(dummyData.Inklings).forEach(
          (inkling: Inkling) => (dummyData.Thoughts[inkling.timeId] = inkling)
        );

        // 2. Clear Inklings
        const inklingIds: Set<TimestampTzPg> = new Set(
          Object.values(dummyData.Inklings).map((i: Inkling) => i.timeId)
        );
        dummyData.Inklings = {};

        // 3. Create JournalEntry
        const keepThoughts: TimestampTzPg[] = keepIds.filter(
          (id) => !inklingIds.has(id)
        );
        const keepInklings: TimestampTzPg[] = keepIds.filter((id) =>
          inklingIds.has(id)
        );
        const discardThoughts: TimestampTzPg[] = discardIds.filter(
          (id) => !inklingIds.has(id)
        );
        const discardInklings: TimestampTzPg[] = discardIds.filter((id) =>
          inklingIds.has(id)
        );

        const id: TimestampTzPg = serializeDate(new Date());
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
        console.log(dummyData.JournalEntries);

        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    },
  },
} as ResolverFragment;
