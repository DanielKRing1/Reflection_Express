import { Dict } from "./types/global.types";

declare global {
  namespace Express {
    export interface Request {
      jwtPayload?: Dict<any>;
    }
  }
}

export {};
