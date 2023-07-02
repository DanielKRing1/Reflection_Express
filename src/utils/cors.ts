export const CORS_ORIGIN: string = (() => {
    switch (process.env.NODE_ENV) {
        case "prod":
            return process.env.CORS_ORIGIN || ".";
        case "dev":
            return "http://localhost:3000";

        case "test":
        default:
            return "http://localhost:3000";
    }
})();
