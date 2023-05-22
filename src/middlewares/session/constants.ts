import { SameSite } from "./types";

export const COOKIE_ARGS_LAX = {
    // sameSite: "none" as SameSite,
    secure: false, // if true only transmit cookie over https
    domain: "reflection.fly.dev",
    // secure: true, // if true only transmit cookie over https
    httpOnly: true, // if true prevent client side JS from reading the cookie
};

export const COOKIE_ARGS_PROTECTED = {
    // sameSite: "none" as SameSite,
    secure: false, // if true only transmit cookie over https
    domain: "reflection.fly.dev",
    // secure: true, // if true only transmit cookie over https
    httpOnly: true, // if true prevent client side JS from reading the cookie
};
