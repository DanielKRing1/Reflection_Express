import jwt from "jsonwebtoken";
import { Dict } from "../../types/global.types";

type SignOptions = {
    algorithm?: jwt.Algorithm;
    expiresIn?: number;
};
export default async (
    payload: Dict<any>,
    secret: string,
    { algorithm = "HS256", expiresIn = 0 }: SignOptions = {}
) => {
    // 1. Await token generation
    const token: string | undefined = await new Promise<string | undefined>(
        (res, rej) =>
            jwt.sign(
                payload,
                secret,
                { algorithm, expiresIn },
                function (err, token) {
                    if (err) return res(undefined);

                    return res(token);
                }
            )
    );

    // 2. Throw error if undefined token
    if (token === undefined)
        throw new Error("sign.jwt() produced an undefined token");

    // 3. Return valid token
    return token;
};
