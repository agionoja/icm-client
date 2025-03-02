import { fetchClient, type ResponseKey } from "~/fetch/fetch-client.server";
import { data } from "react-router";
import type { IUser } from "icm-shared";
import { safeRedirect } from "~/utils/safe-redirect";
import { createSession, RoleRedirects } from "~/session";
import { destroyUserDataCookie } from "~/cookies/user-cookie";
import apiEndpoints from "~/api-endpoints";

type LoginArgs = {
  email: string | FormDataEntryValue;
  password: string | FormDataEntryValue;
};

// Utility to create error response
const createErrorResponse = (message: string, statusCode?: number) =>
  data({ error: { message, statusCode } }, { status: statusCode });

export async function login(
  request: Request,
  redirectTo: string | FormDataEntryValue,
  loginDto: LoginArgs,
) {
  // Step 1: Authenticate user and get token
  const { data: userToken, exception: authException } = await fetchClient<
    string,
    ResponseKey<"accessToken">
  >(apiEndpoints.auth.login, {
    responseKey: "accessToken",
    method: "POST",
    body: JSON.stringify(loginDto),
  });

  if (authException) {
    return createErrorResponse(authException.message);
  }

  // Step 2: Fetch user profile with token
  const {
    data: profile,
    exception: profileException,
    message: profileMessage,
  } = await fetchClient<IUser, ResponseKey<"user">>(apiEndpoints.auth.profile, {
    responseKey: "user",
    token: userToken?.accessToken,
  });

  // Step 3: Validate profile and role
  if (
    profileException ||
    !profile?.user?.role ||
    !RoleRedirects[profile.user.role]
  ) {
    return createErrorResponse(
      profileException?.message || "Something went very wrong",
      profileException?.statusCode,
    );
  }

  // Step 4: Prepare session and redirect
  const redirectUrl = safeRedirect(
    redirectTo,
    RoleRedirects[profile.user.role] ?? "/",
  );
  const token = userToken?.accessToken;
  const welcomeMessage =
    profileMessage || `Welcome back ${profile.user.firstname}!`;

  throw await createSession(
    {
      role: profile.user.role,
      request,
      token,
      remember: true,
      message: welcomeMessage,
      redirectTo: redirectUrl,
    },
    {
      headers: {
        "Set-Cookie": await destroyUserDataCookie(),
      },
    },
  );
}
