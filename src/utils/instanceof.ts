import { regExpOr } from "./regex";

export enum InstanceType {
  Date,
  ISO,
  String,
  Number,
}
export const getType = (val: any) => {};
export const instanceOf = (val: any, type: InstanceType): boolean => {
  switch (type) {
    case InstanceType.Date: {
      return val instanceof Date;
    }
    case InstanceType.ISO: {
      return isISO(val);
    }
    case InstanceType.String: {
      return typeof val === "string" || val instanceof String;
    }
    case InstanceType.Number: {
      return !isNaN(val);
    }
    default:
      return false;
  }
};

// ISO

export const isISO = (str: string): boolean =>
  regExpOr([
    /^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))$/,
    /^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$/,
    /^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$/,
  ]).test(str);
