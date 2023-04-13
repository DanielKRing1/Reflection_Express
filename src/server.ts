import expressApp from "./app";
import gqlServer from "./gqlServer";

import access from "./middlewares/session/access";

export default gqlServer(expressApp, access);
