import { Request, Response } from "express";

export default interface GqlContext {
  token?: string;
  dbConn?: any;
  res: Response;
}

export interface RequestWGqlContext extends Request {
  gqlContext: {
    token?: string;
    dbConn?: any;
  };
}
