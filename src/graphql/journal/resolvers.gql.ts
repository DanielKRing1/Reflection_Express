import dummyData from "../dummyData";
import { ResolverFragment } from "../types/schema.types";
import { Journal } from "./schema.gql";

export default {
  Query: {
    journals: (): Journal[] => {
      return Object.values(dummyData.Journals);
    },
  },
  Mutation: {
    createJournal: (userId: number, journalName: string): number => {
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
