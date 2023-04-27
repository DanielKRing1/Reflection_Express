import { GraphQLError } from "graphql";
import { ApolloServerErrorCode } from "@apollo/server/errors";

export const UNAUTHENTICATED_GQL_ERROR_CODE = "UNAUTHENTICATED";
export const genUnauthenticatedError = (): GraphQLError =>
    new GraphQLError("you must be logged in to query this schema", {
        extensions: {
            code: UNAUTHENTICATED_GQL_ERROR_CODE,
        },
    });

export const genInternalServerError = (err: any): GraphQLError => {
    // Received Error
    if (err instanceof Error)
        return new GraphQLError(err.message, {
            extensions: {
                code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
            },
        });
    // Received something else
    else
        return new GraphQLError(err, {
            extensions: {
                code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
            },
        });
};
