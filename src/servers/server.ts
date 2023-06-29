import genExpressApp from "./app";
import gqlServer from "./gqlServer";

import accessPromise from "../middlewares/session/access";

export default (async () => {
    const app = await genExpressApp();
    const access = await accessPromise();

    return gqlServer(app, access);
})();
