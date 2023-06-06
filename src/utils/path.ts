import { Request } from "express";

export const getHttpType = (req: Request) =>
    req.secure === true ? "https" : "http";

export const getFullHost = (req: Request) =>
    `${req.protocol}://${req.get("host")}`;

export const getFullUrl = (req: Request) =>
    `${getFullHost(req)}${req.originalUrl}`;
