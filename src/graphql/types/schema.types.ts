import { Dict } from "../../types/global.types";

export type SchemaFragment = {
  Types: String;
  Query: String;
  Mutation: String;
};

export type ResolverFragment = {
  Query: Dict<any>;
  Mutation: Dict<any>;
};
