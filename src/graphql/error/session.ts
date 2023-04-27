import { Request, Response } from "express";
import { genUnauthenticatedError } from "./errorGenerators";

type Context = {
    req: Request;
    res: Response;
};
export const getUserId = (context: Context): string => {
    const userId = context.req.session.userId;

    if (userId === undefined) {
        throw genUnauthenticatedError();
    }

    return userId;
};
