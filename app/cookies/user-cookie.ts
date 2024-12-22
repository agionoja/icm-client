import { createCookie } from "react-router";
import { baseCookieOptions } from "~/cookies/base-cookie-options";
import { getNestjsSessionMaxAgeInSeconds } from "~/session";
import type { IFacebookUser, IGoogleUser, IUser, IIcmUser } from "icm-shared";
import { decrypt, encrypt } from "~/utils/crypto";

/**
 * The Name of the cookie used to store user information securely.
 */
const USER_DATA_COOKIE_NAME = "user.data";

/**
 * This cookie is used to store encrypted user data.
 * It is created with baseCookieOptions,
 * which includes configurations such as HttpOnly, SameSite, and secure flags.
 */
const userCookie = createCookie(USER_DATA_COOKIE_NAME, {
  ...baseCookieOptions,
});

/**
 * Stores encrypted user information in a cookie. The expiration time is determined by
 * the session expiration provided by the NestJS server.
 *
 * @param {IUser} user - The user object to be stored.
 * @param {Request} request - The request object containing headers.
 * @param {string} [token] - Optional JWT token to calculate session expiration.
 * @returns {Promise<string>} Serialized cookie string to be used in headers.
 */
export async function setUserDataCookie(
  user: IUser,
  request: Request,
  token?: string,
): Promise<string> {
  const encrypted = await encrypt(user);
  const maxAge = await getNestjsSessionMaxAgeInSeconds(token || request);
  return userCookie.serialize(encrypted, {
    maxAge,
  });
}

/**
 * Retrieves and decrypts the user data from the cookie in the request headers.
 *
 * @param {Request} request - The request object containing headers.
 * @returns {Promise<IUser | IGoogleUser | IFacebookUser | null>} The decrypted user data or null if not available.
 */
export async function getUserDataCookie(
  request: Request,
): Promise<IUser | IGoogleUser | IFacebookUser | null> {
  const cookie = request.headers.get("Cookie");
  const encryptedUser = await userCookie.parse(cookie);

  if (!encryptedUser) return null;
  return decrypt<IIcmUser | IGoogleUser | IFacebookUser>(encryptedUser) ?? null;
}

/**
 * Destroys the user cookie by setting it with an expiration date in the past.
 *
 * @returns {Promise<string>} Serialized cookie string to invalidate the user cookie.
 */
export async function destroyUserDataCookie(): Promise<string> {
  return userCookie.serialize("", { expires: new Date(0) });
}
