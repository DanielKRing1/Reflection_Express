import { PrismaClient } from "./generated/client";

let prisma = new PrismaClient({
    // log: ["query"],
});

export default prisma;
