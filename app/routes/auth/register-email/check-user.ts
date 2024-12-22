import { fetchClient } from "~/fetch/fetch-client.server";
import type { IUser } from "icm-shared";

export async function checkUser(email: string, phone: string) {
  const [findByEmail, findByPhone] = await Promise.all([
    fetchClient<boolean, "isExists", IUser>("/auth/check-user", {
      responseKey: "isExists",
      query: { filter: { email } },
    }),
    fetchClient<boolean, "isExists", IUser>("/auth/check-user", {
      responseKey: "isExists",
      query: { filter: { phone } },
    }),
  ]);

  if (findByEmail.exception || findByPhone.exception) {
    return {
      exists: false,
      error: {
        label: "exception",
        statusCode:
          findByPhone.exception?.statusCode ||
          findByPhone.exception?.statusCode,
        message:
          findByEmail.exception?.message || findByPhone.exception?.message,
      } as const,
    };
  }

  const checkEmail = findByEmail.data.isExists;
  const checkPhone = findByPhone.data.isExists;

  if (checkEmail && checkPhone) {
    return {
      exists: true,
      error: {
        message: `phone number and email address are already in use`,
        statusCode: 409,
        label: "both",
      } as const,
    };
  }

  if (checkPhone) {
    return {
      exists: true,
      error: {
        message: `phone number is already in use`,
        statusCode: 409,
        label: "phone",
      } as const,
    };
  }

  if (checkEmail) {
    return {
      exists: true,
      error: {
        message: `email address is already in use`,
        statusCode: 409,
        label: "email",
      } as const,
    };
  }

  return {
    exists: false,
    error: null,
  };
}
