import http from "http";

import server from "./servers/server";

import { PORT } from "./config/server.config";

// START SERVER
export default (async (): Promise<http.Server> => {
    const _: http.Server = await new Promise(async (resolve) => {
        resolve((await server).listen({ port: PORT }));
    });

    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);

    return _;
})();
