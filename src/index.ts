import http from "http";

import app from "./app";
import gqlServer from "./gqlServer";
import accessSession from "./middlewares/session/access";

import { PORT } from "./config/server.config";

// START SERVER
export default (async (): Promise<http.Server> => {
    const server: http.Server = await new Promise(async (resolve) => {
        resolve((await gqlServer(app, accessSession)).listen({ port: PORT }));
    });

    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);

    return server;

    // app.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));

    // setTimeout(async () => {
    //     const res = await axios.post("http://localhost:4000/login/create-user", {
    //         userId: "Daniel",
    //         password: "password1",
    //     });
    //     console.log("axios response---------------------------");
    //     console.log(res);

    //     setTimeout(async () => {
    //         const res = await axios.post(
    //             "http://localhost:4000/login/create-user",
    //             {
    //                 userId: "Daniel",
    //                 password: "password1",
    //             }
    //         );
    //         console.log("axios response---------------------------");
    //         console.log(res);
    //     }, 5000);
    // }, 5000);
})();
