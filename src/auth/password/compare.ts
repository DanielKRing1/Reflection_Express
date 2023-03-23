import bcrypt from "bcrypt";

/**
 * Return true if plaintext hashes to 'hash'
 * Else false
 *
 * @param plaintext String to hash+compare with 'hash'
 * @param hash Stored, hashed password
 */
export default async function compare(plaintext: string, hash: string) {
  const isValid = await new Promise((resolve, reject) => {
    bcrypt.compare(plaintext, hash, function (err, result) {
      if (result === true) return resolve(true);

      if (err) console.log(err);
      return resolve(false);
    });
  });

  return isValid;
}
