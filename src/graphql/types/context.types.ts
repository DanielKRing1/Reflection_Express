import { Request, Response } from "express";

export default interface GqlContext {
  token?: string;
  dbConn?: any;
  req: Request;
  res: Response;
}

export interface RequestWGqlContext extends Request {
  gqlContext: {
    token?: string;
    dbConn?: any;
  };
}
