import app from "./app";
import gqlServer from "./gqlServer";

import { PORT } from "./config/server.config";

// START SERVER
export default (async () => {
    await new Promise<void>(async (resolve) =>
        (await gqlServer(app)).listen({ port: PORT }, resolve)
    );
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
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
