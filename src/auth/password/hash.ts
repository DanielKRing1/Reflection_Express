import bcrypt from "bcrypt";

import { SALT_ROUNDS } from "../constants";

export default async function hashAndSalt(
  plaintext: string,
  saltRounds = SALT_ROUNDS
): Promise<string> {
  const hash = await new Promise<string>((resolve, reject) =>
    bcrypt.hash(plaintext, saltRounds, function (err, h) {
      if (err) reject(err);
      resolve(h);
    })
  );

  return hash;
}
