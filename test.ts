import { createClient } from "redis";

export const main = async () => {
    console.log("Start");

    const client = createClient({
        url: "rediss://default:e71ec5b7e52540b9a1b1c1b133162063@pure-snail-36615.upstash.io:36615",
    });

    client.on("error", function (err) {
        throw err;
    });
    console.log("Connect");
    await client.connect();
    console.log("Write");
    await client.set("foo", "bar");

    console.log("End");
};

main();
