import { TimestampTzPg } from "../../../types/db.types";
import { serializeDate } from "../../../utils/date";
import dummyData from "../../dummyData";
import { Journal } from "../journal/schema.gql";
import { ResolverFragment } from "../../types/schema.types";
import { CommitInklingsArgs, Inkling, InklingsArgs } from "./schema.gql";

export default {
  Query: {
    inklings: (
      _: undefined,
      { userId, journalId }: InklingsArgs,
      contextValue: any,
      info: any
    ) => {
      try {
        const journal: Journal = dummyData.Journals[journalId];
        if (journal.userId !== userId)
          throw new Error(
            `inklings() received an invalid request to fetch from journal ${journalId}, which does not correspond with user ${userId}`
          );

        return Object.values(dummyData.Inklings).filter(
          (i: Inkling) => i.journalId === journalId
        );
      } catch (err) {
        return [];
      }
    },
  },
  Mutation: {
    commitInklings: (
      _: undefined,
      { userId, journalId, inklingTexts }: CommitInklingsArgs,
      contextValue: any,
      info: any
    ) => {
      /**
        INSERT INTO Comment (postId, userId, text)
        SELECT <postId>, <userId>, <commentText>
        WHERE EXISTS (SELECT 1 FROM Post WHERE id = <postId> AND userId = <userId>)
       */

      try {
        const journal: Journal = dummyData.Journals[journalId];
        if (journal.userId !== userId)
          throw new Error(
            `commitInklings() received an invalid request to insert into journal ${journalId}, which does not correspond with user ${userId}`
          );

        inklingTexts.forEach((text: string) => {
          const id: TimestampTzPg = serializeDate(
            new Date(Math.random() * 1000000)
          );

          dummyData.Inklings[id] = {
            timeId: id,
            journalId,
            text,
          };
        });

        return true;
      } catch (err) {
        return false;
      }
    },
  },
} as ResolverFragment;
