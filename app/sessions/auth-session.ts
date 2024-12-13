import { createCookieSessionStorage, redirect } from "react-router";
import { jwtDecode, type JwtPayload, InvalidTokenError } from "jwt-decode";
import { baseCookieOptions } from "~/cookies/base-cookie-options";
import { GoogleUser, IcmUser, Role } from "../../../icm-shared/src";
import { redirectWithError, redirectWithSuccess } from "remix-toast";
import { fetchClient } from "~/fetch/fetch-client";
import { SESSION_TIMEOUT } from "~/sessions/auth-timeout-session";
import { ONE_YEAR } from "~/cookies/max-age";

type SessionData = {
  token: string;
  role: keyof typeof Role;
};

/**
 * Session duration is set to one year to ensure it is almost always available.
 * Sessions will be invalidated dynamically if a request fails validation in the NestJS server.
 */
export const YEAR_IN_SECONDS = ONE_YEAR;

export const { destroySession, getSession, commitSession } =
  createCookieSessionStorage<SessionData>({
    cookie: {
      ...baseCookieOptions,
      name: "_session",
    },
  });

export async function getUserSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return getSession(cookie);
}

export async function getToken(request: Request) {
  return (await getUserSession(request)).get("token");
}

export async function getRole(request: Request) {
  return (await getUserSession(request)).get("role");
}

export async function hasSession(request: Request) {
  const token = await getToken(request);
  const role = await getRole(request);

  return !(!token || !role);
}

export async function hasNestJsSessionExpired(
  request: Request,
): Promise<boolean> {
  try {
    const jwtPayload = await getJwtPayload(request);
    const jwtExp = "exp" in jwtPayload && jwtPayload.exp;

    if (!jwtExp) return true;

    return jwtExp * 1000 < Date.now();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return true;
  }
}

export async function forceLogoutAfterNestJsSessionExpires(request: Request) {
  const isExpired = await hasNestJsSessionExpired(request);

  if (isExpired) {
    const session = await getUserSession(request);
    throw await redirectWithError(
      "Your session has timed out. Please log in again.",
      "/auth/login",
      {
        headers: {
          "Set-Cookie": await destroySession(session),
        },
      },
    );
  }
}

export async function requireUser(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const searchParams = new URLSearchParams([["redirect", redirectTo]]);

  const redirectUrl =
    redirectTo && redirectTo !== "/"
      ? `/auth/login?${searchParams}`
      : "/auth/login";
  if (!(await hasSession(request))) {
    throw await redirectWithError(
      redirectUrl,
      "You are not logged in. Log in to gain access",
    );
  }
  const token = await getToken(request);

  const { exception, data } = await fetchClient<IcmUser | GoogleUser, "user">(
    "/auth/profile",
    {
      responseKey: "user",
      token,
    },
  );

  if (exception) {
    if (exception.statusCode === 401)
      throw await redirectWithError(redirectUrl, exception.message, {
        headers: {
          "Set-Cookie": await destroySession(await getUserSession(request)),
        },
      });
    throw await redirectWithError(redirectUrl, exception.message);
  }

  return data?.user;
}

interface CreateSession {
  request: Request;
  token: string;
  role?: SessionData["role"];
  remember: boolean;
  redirectTo: string;
  message: string;
  init?: ResponseInit;
}

export async function createSession({
  request,
  token,
  redirectTo,
  remember = false,
  message = "Welcome Back",
  role = "USER",
  init,
}: CreateSession) {
  const session = await getUserSession(request);
  session.set("token", token);
  session.set("role", role);

  const headers = new Headers(init?.headers);
  headers.append("Set-Cookie", await commitSession(session));

  return redirectWithSuccess(redirectTo, message, {
    headers,
  });
}

export async function getJwtPayload(request: Request) {
  const token = await getToken(request);
  try {
    return jwtDecode<JwtPayload>(token || "");
  } catch (e) {
    return e as InvalidTokenError;
  }
}

export async function getNestjsSessionMaxAge(request: Request) {
  const jwtPayload = await getJwtPayload(request);
  const expire =
    "exp" in jwtPayload && jwtPayload.exp ? jwtPayload.exp * 1000 : 0;

  return expire - Date.now();
}
export async function logout(
  request: Request,
  redirectTo = "/auth/login",
  init?: ResponseInit,
) {
  const headers = new Headers(init?.headers);
  const cookie = await destroySession(await getUserSession(request));
  headers.append("Set-Cookie", cookie);
  return redirect(redirectTo, {
    ...init,
    headers,
  });
}
