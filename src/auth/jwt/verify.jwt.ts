import jwt from "jsonwebtoken";
import { Dict } from "../../types/global.types";

export default async (token: string, secret: string) => {
    // 1. Await payload decoding
    const payload: Dict<any> | undefined = await new Promise<
        Dict<any> | undefined
    >((res, rej) =>
        jwt.verify(token, secret, function (err, payload) {
            if (err) return res(undefined);

            return res(payload as Dict<any>);
        })
    );

    // 2. Throw error if undefined payload
    if (payload === undefined)
        throw new Error("verify.jwt() produced an undefined payload");

    // 3. Return valid payload
    return payload;
};
