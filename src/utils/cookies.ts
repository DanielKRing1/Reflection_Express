import { Response } from "express";
import setCookie from "set-cookie-parser";

export type HttpCookieResponse = {
  status: number;
  headers: {
    "set-cookie": string;
  } & any;
};
export const mergeCookies = (
  httpResponse: HttpCookieResponse,
  expressRes: Response
) => {
  if (httpResponse.status >= 400)
    throw new Error(
      `mergeCookies() received an httpResponse with status code: ${httpResponse.status}`
    );

  // 6.3. Strip refresh cookie from response
  // Get all cookies from cookie header
  const cookies = setCookie.parse(httpResponse as any);
  console.log(cookies);

  // 6.4. Attach refresh cookie to res.cookie
  cookies.forEach((cookie) =>
    expressRes.cookie(cookie.name, cookie.value, cookie as any)
  );
};
