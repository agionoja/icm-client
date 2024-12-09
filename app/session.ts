import { createCookieSessionStorage, redirect } from "react-router";
import { jwtDecode, type JwtPayload } from "jwt-decode";
import { baseCookieOptions } from "~/cookies/base-cookie-options";
import { GoogleUser, IcmUser, Role } from "@agionoja/icm-shared";
import { redirectWithError, redirectWithSuccess } from "remix-toast";
import { fetchClient } from "~/fetch/fetch-client";

type SessionData = {
  token: string;
  role: keyof typeof Role;
};

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

export async function requireUser(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const token = await getToken(request);

  const searchParams = new URLSearchParams([["redirect", redirectTo]]);
  const redirectUrl =
    redirectTo && redirectTo !== "/"
      ? `/auth/login?${searchParams}`
      : "/auth/login";

  if (!token) {
    throw await redirectWithError(redirectUrl, "You are not authorized");
  }
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
}: CreateSession) {
  const session = await getUserSession(request);
  session.set("token", token);
  session.set("role", role);

  const maxAge = await getSessionMaxAge(token);
  return redirectWithSuccess(redirectTo, message, {
    headers: {
      "Set-Cookie": await commitSession(session, {
        maxAge: remember ? maxAge : undefined,
      }),
    },
  });
}

export async function getSessionMaxAge(token: string) {
  try {
    const decodedToken = jwtDecode<JwtPayload>(token || "");
    const decodedExpires = decodedToken.exp ? decodedToken.exp : 0;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    return decodedExpires - nowInSeconds;
  } catch (e) {
    console.error("Error decoding jwt", e);
  }
}

export async function logout(request: Request, redirectTo = "/auth/login") {
  return redirect(redirectTo, {
    headers: {
      "Set-Coolie": await destroySession(await getUserSession(request)),
    },
  });
}
