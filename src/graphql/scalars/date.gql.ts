import { GraphQLError, GraphQLScalarType, Kind } from "graphql";
import { instanceOf, InstanceType } from "../../utils/instanceof";
import { ScalarFragment } from "../types/schema.types";

// NAME

const CUSTOM_SCALAR_NAME = "DateTime";

// DEFINITION

const datetimeScalar = new GraphQLScalarType({
    name: "DateTime",
    description: "DateTime custom scalar type",
    serialize(value): number {
        // 1. ISO String -> cast to Date
        if (
            instanceOf(value, InstanceType.String) &&
            instanceOf(value, InstanceType.ISO)
        )
            value = new Date(value as string);
        // 2. Date obj -> return ms
        if (instanceOf(value, InstanceType.Date))
            return (value as Date).getTime(); // Convert outgoing Date to integer for JSON
        // 3. Number -> return raw number
        if (instanceOf(value, InstanceType.Number)) return value as number;

        throw new GraphQLError(
            "GraphQL Date Scalar serializer expected a `ISO string | Date | number` data type",
            {
                extensions: {
                    code: "GRAPHQL_PARSE_FAILED",
                },
            }
        );
    },
    parseValue(value): Date {
        // 1. ISO String -> return Date
        if (
            instanceOf(value, InstanceType.String) &&
            instanceOf(value, InstanceType.ISO)
        )
            return new Date(value as string);
        // 2. Number -> return Date
        if (instanceOf(value, InstanceType.Number))
            return new Date(value as number); // Convert incoming integer to Date

        throw new GraphQLError(
            "GraphQL Date Scalar parser expected a `ISO string | number`",
            {
                extensions: {
                    code: "GRAPHQL_PARSE_FAILED",
                },
            }
        );
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
            // Convert hard-coded AST string to integer and then to Date
            return new Date(parseInt(ast.value, 10));
        }
        if (ast.kind === Kind.STRING) {
            // Convert hard-coded AST string to integer and then to Date
            return new Date(ast.value);
        }
        // Invalid hard-coded value (not an integer)
        return null;
    },
});

// EXPORT

export default {
    Schema: `scalar ${CUSTOM_SCALAR_NAME}`,
    Resolver: {
        [CUSTOM_SCALAR_NAME]: datetimeScalar,
    },
} as ScalarFragment;
