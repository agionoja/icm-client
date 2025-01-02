import { fetchClient, type ResponseKey } from "~/fetch/fetch-client.server";
import { data } from "react-router";
import type { IUser } from "icm-shared";
import { safeRedirect } from "~/utils/safe-redirect";
import { createSession, RoleRedirects } from "~/session";
import { destroyUserDataCookie } from "~/cookies/user-cookie";

type LoginArgs = {
  email: string | FormDataEntryValue;
  password: string | FormDataEntryValue;
};

export async function login(
  request: Request,
  redirectTo: string | FormDataEntryValue,
  loginDto: LoginArgs,
) {
  const { data: userToken, exception } = await fetchClient<
    string,
    ResponseKey<"accessToken">
  >("/auth/login", {
    responseKey: "accessToken",
    method: "POST",
    body: JSON.stringify(loginDto),
  });

  const {
    data: profile,
    exception: profileException,
    message: profileMessage,
  } = await fetchClient<IUser, ResponseKey<"user">>("/auth/profile", {
    responseKey: "user",
    token: userToken?.accessToken,
  });

  if (exception || profileException || !RoleRedirects[profile.user.role]) {
    return data(
      {
        error: {
          message:
            exception?.message ||
            profileException?.message ||
            "Something went very wrong.",
          statusCode: exception?.statusCode || exception?.statusCode,
        },
      },
      { status: exception?.statusCode || profileException?.statusCode },
    );
  }

  const redirectUrl = safeRedirect(
    redirectTo,
    profile?.user?.role ? (RoleRedirects[profile.user.role] ?? "/") : "/",
  );

  const token = userToken?.accessToken;

  return createSession(
    {
      role: profile.user.role,
      request,
      token,
      remember: true,
      message: profileMessage || `Welcome back ${profile?.user.firstname}!`,
      redirectTo: redirectUrl,
    },
    {
      headers: {
        "Set-Cookie": await destroyUserDataCookie(),
      },
    },
  );
}
