import { CookieOptions, Response } from "express";
import setCookie from "set-cookie-parser";
import { SameSite } from "../middlewares/session/types";

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
    // console.log("refresh response cookies");
    // console.log(cookies);
    // console.log(expressRes.getHeader("Set-Cookie"));

    // 6.4. Attach refresh cookie to res.cookie
    cookies.forEach((cookie) => {
        expressRes.cookie(cookie.name, cookie.value, {
            expires: cookie.expires,
            domain: cookie.domain,
            path: cookie.path,
            sameSite: cookie.sameSite as SameSite,
            httpOnly: cookie.httpOnly,
        });
    });

    // console.log("new express response cookies");
    // console.log(expressRes.getHeader("Set-Cookie"));
};

export const clearCookieFromBrowser = (
    cookieName: string,
    res: Response,
    cookieOptions: CookieOptions = {
        domain: COOKIE_DOMAIN,
    }
) => {
    res.clearCookie(cookieName, {
        ...cookieOptions,
        expires: new Date(0),
    });
};

export const COOKIE_DOMAIN: string = (() => {
    switch (process.env.NODE_ENV) {
        case "prod":
            return process.env.COOKIE_DOMAIN || ".";
        case "dev":
            return ".localhost";

        case "test":
        default:
            return ".";
    }
})();
