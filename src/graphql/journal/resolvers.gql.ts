import dummyData from "../dummyData";
import { ResolverFragment } from "../types/schema.types";
import { CreateJournalArgs, Journal, JournalsArgs } from "./schema.gql";

export default {
  Query: {
    journals: (
      _: undefined,
      { userId }: JournalsArgs,
      contextValue: any,
      info: any
    ): Journal[] => {
      return Object.values(dummyData.Journals);
    },
  },
  Mutation: {
    createJournal: (
      _: undefined,
      { userId, journalName }: CreateJournalArgs,
      contextValue: any,
      info: any
    ): number => {
      try {
        const id: number = Date.now();

        dummyData.Journals[id] = {
          id,
          userId,
          name: journalName,
        };

        return id;
      } catch (err) {
        return -1;
      }
    },
  },
} as ResolverFragment;
