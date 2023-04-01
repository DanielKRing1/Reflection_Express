import { Request, Response, NextFunction } from "express";

import verifyJwt from "../../auth/jwt/verify.jwt";
import { Dict } from "../../types/global.types";

/**
 * This middleware checks for a jwt string on the req.body
 * verifies the jwt
 * and attaches the jwt payload to req.jwtPayload
 */
type JwtBody = {
  jwt: string;
};
export type JwtReq = {
  jwt: Dict<any>;
};
export default async (
  req: Request<{}, {}, JwtBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Get jwt
    const jwt: string = req.body.jwt;

    // 2. No jwt
    if (jwt === undefined)
      throw new Error(
        `verify.middleware() did not find a "jwt" attribute in req.payload`
      );

    // 3. Get jwt payload
    // May throw error if invalid
    const payload: Dict<any> = await verifyJwt(
      jwt,
      process.env.JWT_SECRET as string
    );

    // 4. Attach 'jwt' to req object
    req.jwtPayload = payload;

    // 5. Next
    return next();
  } catch (err) {
    console.log(err);
    return res.status(403).send("Unauthorized");
  }
};
