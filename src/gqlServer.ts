import { Express, NextFunction, Request, Response } from "express";

// GRAPHQL
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import typeDefs from "./graphql/schema";
import resolvers from "./graphql/resolvers";
import GqlContext, { RequestWGqlContext } from "./graphql/types/context.types";

// CONFIG
import { PORT } from "./config/server.config";
import { GQL_PATH } from "./graphql/constants";

export default async (
    app: Express,
    ...middlewares: ((
        req: Request,
        res: Response,
        next: NextFunction
    ) => void)[]
) => {
    // Our httpServer handles incoming requests to our Express app.
    // Below, we tell Apollo Server to "drain" this httpServer,
    // enabling our servers to shut down gracefully.
    const httpServer = http.createServer(app);

    // Same ApolloServer initialization as before, plus the drain plugin
    // for our httpServer.
    const server = new ApolloServer<GqlContext>({
        typeDefs,
        resolvers,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    // Ensure we wait for our server to start
    await server.start();
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    app.use(
        GQL_PATH,
        ...middlewares,
        expressMiddleware(server, {
            // TODO Add 'gqlContext' object to req object in auth middleware
            context: async ({ req, res }): Promise<GqlContext> => ({
                ...(req as RequestWGqlContext).gqlContext,
                req,
                res,
            }),
        })
    );

    // START SERVER
    await new Promise<void>((resolve) =>
        httpServer.listen({ port: PORT }, resolve)
    );
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    // app.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));
};
