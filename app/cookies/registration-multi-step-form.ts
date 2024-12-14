import { createCookie } from "react-router";
import {
  baseCookieOptions,
  getCookieFromHeader,
} from "~/cookies/base-cookie-options";

type RegistrationStep1Data = {
  firstname?: string;
  lastname?: string;
  phone?: string;
  email?: string;
};

type RegistrationStep2Data = {
  password?: string;
  passwordConfirm?: string;
};

interface RegistrationData
  extends RegistrationStep1Data,
    RegistrationStep2Data {}

export const registrationProgressCookie = createCookie(
  "registration-progress",
  {
    ...baseCookieOptions,
    maxAge: 604_800, // one week
    path: "/auth/register",
  },
);

export async function getRegistrationProgressFromCookie(request: Request) {
  return ((await registrationProgressCookie.parse(
    getCookieFromHeader(request),
  )) || {}) as RegistrationData;
}

export async function setRegistrationProgressCookie(
  data: RegistrationData | (() => RegistrationData),
  request: Request,
) {
  // Check if data is a function, and if so, call it to get the actual data
  const parsedData = typeof data === "function" ? data() : data;

  // console.log(parsedData);
  const existingData = await getRegistrationProgressFromCookie(request);

  // Merge existing data with the new data
  return registrationProgressCookie.serialize({
    ...existingData,
    ...parsedData,
  });
}
