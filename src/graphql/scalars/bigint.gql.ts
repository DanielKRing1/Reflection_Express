import { GraphQLError, GraphQLScalarType, Kind } from "graphql";
import { ScalarFragment } from "../types/schema.types";

// NAME

const CUSTOM_SCALAR_NAME = "BigInt";

// DEFINITION

const bigintScalar = new GraphQLScalarType({
    name: "BigInt",
    description:
        "BigInt custom scalar type (Postgres returns bigint values with 'n' as a postfix,\
        so this scalar will convert that value from the db to a string without the postfix,\
        and this scalar will convert incoming string values to the BigInt type)",
    serialize(value): string {
        try {
            // 1. BigInt -> convert to String
            return (value as BigInt).toString();
        } catch (err) {
            console.log(err);
        }

        throw Error(
            "GraphQL Date Scalar serializer expected a `BigInt` data type"
        );
    },
    parseValue(value) {
        try {
            return BigInt(value as string);
        } catch (err) {
            console.log(err);
        }

        throw new GraphQLError(
            "GraphQL Date Scalar parser expected a `string`",
            {
                extensions: {
                    code: "GRAPHQL_PARSE_FAILED",
                },
            }
        );
    },
    parseLiteral(ast) {
        try {
            if (ast.kind === Kind.STRING) {
                // Convert hard-coded AST string to BigInt
                return BigInt(ast.value);
            }
        } catch (err) {
            console.log(err);
        }

        // Invalid hard-coded value (not a string)
        return null;
    },
});

// EXPORT

export default {
    Schema: `scalar ${CUSTOM_SCALAR_NAME}`,
    Resolver: {
        [CUSTOM_SCALAR_NAME]: bigintScalar,
    },
} as ScalarFragment;
