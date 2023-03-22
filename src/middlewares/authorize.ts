import { Request, Response, NextFunction } from "express";
import { GQL_PATH } from "../graphql/constants";
import { AUTH_OP_NAMES } from "../graphql/routes/auth/schema.gql";
import { isGqlAuthRequest } from "../graphql/routes/auth/utils";

export default (req: Request, res: Response, next: NextFunction) => {
  // 1. Ignore gql auth routes
  if (isGqlAuthRequest(req)) next();

  try {
    // 2. Get jwt
    req.cookies
      // 3. Verify jwt

      // 4. Attach 'user' to req

      // 5. Next
      .next();
  } catch (err) {
    console.log(err);
  }
};
