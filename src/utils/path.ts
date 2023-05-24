import { Request } from "express";
import { PORT } from "../config/server.config";

export const getFullHost = (req: Request) =>
    `${req.protocol}://${req.get("host")}`;

export const getFullUrl = (req: Request) =>
    `${getFullHost(req)}${req.originalUrl}`;
