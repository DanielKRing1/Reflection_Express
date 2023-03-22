import { TimestampTzPg } from "../types/db.types";

export const serializeDate = (date: Date): TimestampTzPg =>
  date.toISOString() as TimestampTzPg;

export const deserializeDate = (dateStr: TimestampTzPg) => new Date(dateStr);
