import GqlContext from "../../types/context.types";
import { ResolverFragment } from "../../types/schema.types";
import { UserArgs } from "./schema.gql";

import { User } from "@prisma/client";
import prisma from "../../../prisma/client";

const resolvers = {
    Query: {
        user: async (
            _: undefined,
            { email }: UserArgs,
            contextValue: GqlContext,
            info: undefined
        ): Promise<User | null> => {
            try {
                console.log("GQL USER---------------------------");
                const result = await prisma.user.findUniqueOrThrow({
                    where: {
                        email,
                    },
                });

                console.log(result);

                return result;
            } catch (err) {
                console.log(err);
            }

            return null;
        },
    },
    Mutation: {},
} as ResolverFragment;

export default resolvers;
