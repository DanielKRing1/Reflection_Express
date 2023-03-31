import { Request, Response, NextFunction } from "express";

export type MiddlewareFunc = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;
