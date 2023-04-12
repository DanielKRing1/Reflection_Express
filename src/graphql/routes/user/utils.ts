import { Request } from "express";
import { GQL_PATH } from "../../constants";
import { AUTH_OP_NAMES } from "./schema.gql";

export const isGqlAuthRequest = (req: Request): boolean => {
  // 1. Is not graphql route
  const fullPath = req.baseUrl + req.path;
  if (fullPath !== GQL_PATH) return false;

  // 2. Is not auth operation
  const opName: string = req.body.operationName.toLocaleLowerCase();
  if (!AUTH_OP_NAMES.has(opName)) return false;

  return true;
};
