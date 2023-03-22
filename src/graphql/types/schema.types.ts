import { GraphQLScalarType } from "graphql";
import { Dict } from "../../types/global.types";

// CORE

export type SchemaFragment = {
  Types: String;
  Query: String;
  Mutation: String;
};

export type ResolverFragment = {
  Query: Dict<any>;
  Mutation: Dict<any>;
};

// CUSTOM SCALARS

export type ScalarFragment = {
  Schema: String;
  Resolver: Dict<GraphQLScalarType>;
};
