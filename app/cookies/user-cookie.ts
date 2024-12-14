import { createCookie } from "react-router";
import { baseCookieOptions } from "~/cookies/base-cookie-options";
import { getNestjsSessionMaxAge } from "~/session";
import type {
  FacebookUser,
  GoogleUser,
  IcmUser,
  User,
} from "@agionoja/icm-shared";
import { decrypt, encrypt } from "~/utils/crypto";

const USER_COOKIE_NAME = "user-cookie";
const userCookie = createCookie(USER_COOKIE_NAME, { ...baseCookieOptions });

export async function setUserCookie(user: User, request: Request) {
  const encrypted = await encrypt(user);

  // console.log({ user, encrypted });
  return userCookie.serialize(encrypted, {
    maxAge: await getNestjsSessionMaxAge(request),
  });
}

export async function getUserCookie(request: Request) {
  const cookie = request.headers.get("Cookie");
  const encryptedUser = await userCookie.parse(cookie);

  if (!encryptedUser) return null;
  return decrypt<IcmUser | GoogleUser | FacebookUser>(encryptedUser) ?? null;
}
