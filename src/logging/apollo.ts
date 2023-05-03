import { GraphQLRequestContext, GraphQLRequestListener } from "@apollo/server";
import GqlContext from "../graphql/types/context.types";

export const apolloLoggingPlugin = {
    // Fires whenever a GraphQL request is received from a client.
    async requestDidStart(
        requestContext: GraphQLRequestContext<GqlContext>
    ): Promise<void | GraphQLRequestListener<GqlContext>> {
        console.log("Request started! Query:\n" + requestContext.request.query);

        return {
            // // Fires whenever Apollo Server will parse a GraphQL
            // // request to create its associated document AST.
            // async parsingDidStart(requestContext) {
            //   console.log('Parsing started!');
            // },
            // // Fires whenever Apollo Server will validate a
            // // request's document AST against your GraphQL schema.
            // async validationDidStart(requestContext) {
            //   console.log('Validation started!');
            // },
        };
    },
};
