import { fetchClient } from "~/fetch/fetch-client";
import { data } from "react-router";
import type { LoginDto, User } from "@agionoja/icm-shared";
import { safeRedirect } from "~/utils/safe-redirect";
import { createSession, RoleRedirects } from "~/session";
import { setUserDataCookie } from "~/cookies/user-cookie";

export async function login(
  request: Request,
  redirectTo: string | FormDataEntryValue,
  loginDto: LoginDto,
) {
  const { data: userToken, exception } = await fetchClient<
    string,
    "accessToken"
  >("/auth/login", {
    responseKey: "accessToken",
    method: "POST",
    body: JSON.stringify(loginDto),
  });

  const {
    data: profile,
    exception: profileException,
    message: profileMessage,
  } = await fetchClient<User, "user">("/auth/profile", {
    responseKey: "user",
    token: userToken?.accessToken,
  });

  if (exception || profileException) {
    return data(
      {
        error: {
          message: exception?.message || profileException?.message,
          statusCode: exception?.statusCode || exception?.statusCode,
        },
      },
      { status: exception?.statusCode || profileException?.statusCode },
    );
  }

  const redirectUrl = safeRedirect(
    redirectTo,
    profile?.user ? RoleRedirects[profile.user.role] : "/",
  );

  const token = userToken?.accessToken;
  const userCookie = await setUserDataCookie(profile.user, request, token);

  return createSession(
    {
      role: profile.user.role,
      request,
      token,
      remember: true,
      message: profileMessage || `Welcome back ${profile?.user.firstname}!`,
      redirectTo: redirectUrl,
    },
    { headers: { "Set-Cookie": userCookie } },
  );
}
