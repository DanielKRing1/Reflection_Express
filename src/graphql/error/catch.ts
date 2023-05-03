import { GraphQLError } from "graphql";

import {
    UNAUTHENTICATED_GQL_ERROR_CODE,
    genInternalServerError,
} from "./errorGenerators";
import {
    SessionCookieType,
    destroySession,
} from "../../middlewares/session/utils";
import GqlContext from "../types/context.types";

/**
 * Returns original GraphQL error or creates a new one from error message
 * Also clears access cookie session, since user is no longer authenticated but seems to think they are
 *
 * @param err
 * @param res
 * @returns
 */
export const createResolverError = async (
    err: any,
    gqlContext: GqlContext
): Promise<GraphQLError> => {
    console.log(err);

    // 1. Clear Access session cookies if unauthenticated
    if (
        err instanceof GraphQLError &&
        err.extensions.code === UNAUTHENTICATED_GQL_ERROR_CODE
    )
        await destroySession(
            gqlContext.req,
            gqlContext.res,
            SessionCookieType.Access
        );

    // 2. Return GraphQL error
    return err instanceof GraphQLError ? err : genInternalServerError(err);
};
