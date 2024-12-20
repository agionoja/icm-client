import { createCookie } from "react-router";
import {
  baseCookieOptions,
  getCookieFromHeader,
} from "~/cookies/base-cookie-options";
import { decrypt, encrypt } from "~/utils/crypto";

export type Register = {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
};

/**
 * Creates a cookie to store registration progress.
 */
export const registrationProgressCookie = createCookie(
  "registration-progress",
  {
    ...baseCookieOptions,
    maxAge: 604_800, // one week
    path: "/auth/register",
  },
);

/**
 * Retrieves the registration progress from the cookie.
 * @param {Request} request - The request object.
 * @returns {Promise<Partial<Register> | null>} - The decrypted registration progress or null if not found.
 */
export async function getRegistrationProgressFromCookie(
  request: Request,
): Promise<Partial<Register> | null> {
  const cookie = getCookieFromHeader(request);
  const encryptedUser = await registrationProgressCookie.parse(cookie);
  if (!encryptedUser) return null;
  return decrypt<Partial<Register>>(encryptedUser);
}

/**
 * Sets the registration progress in the cookie.
 * @param {Partial<Register> | (() => Partial<Register>)} data - The registration data or a function returning the data.
 * @param {Request} request - The request object.
 * @returns {Promise<string>} - The serialized cookie string.
 */
export async function setRegistrationProgressCookie(
  data: Partial<Register> | (() => Partial<Register>),
  request: Request,
): Promise<string> {
  // Check if data is a function, and if so, call it to get the actual data
  const parsedData = typeof data === "function" ? data() : data;

  // console.log(parsedData);
  const existingData = await getRegistrationProgressFromCookie(request);

  const encrypted = await encrypt({ ...existingData, ...parsedData });
  // Merge existing data with the new data
  return registrationProgressCookie.serialize(encrypted);
}

/**
 * Destroys the registration progress cookie.
 * @returns {Promise<string>} - The serialized cookie string with an expired date.
 */
export async function destroyRegistrationProgress(): Promise<string> {
  return registrationProgressCookie.serialize("", { expires: new Date(0) });
}

export function isFormValid(
  form: Partial<Register> | null,
): form is Partial<Register> {
  if (!form) return false;
  return !(!form?.phone || !form?.firstname || !form?.lastname || !form?.email);
}
