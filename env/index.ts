import path from "path";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

// Jest sets NODE_ENV=test
const configureDotEnv = () => {
    // if ((process.env.NODE_ENV as string) === "prod") return;

    try {
        const fileName: string = `.env.${(
            process.env.NODE_ENV as string
        ).trim()}`;
        dotenv.config({
            path: path.resolve(__dirname, `./${fileName}`),
        });

        // console.log(process.env); // remove this after you've confirmed it is working
    } catch (err) {
        console.log(err);
    }
};

export default configureDotEnv;
