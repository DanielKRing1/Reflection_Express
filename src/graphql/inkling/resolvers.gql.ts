import dummyData from "../dummyData";
import { Journal } from "../journal/schema.gql";
import { ResolverFragment } from "../types/schema.types";

export default {
  Query: {
    inklings: () => Object.values(dummyData.Inklings),
  },
  Mutation: {
    commitInklings: (
      userId: number,
      journalId: number,
      inklingTexts: string[]
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
          const id = Math.random() * 1000000;

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
