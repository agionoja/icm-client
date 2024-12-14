import { createCookieSessionStorage, redirect } from "react-router";
import { jwtDecode, type JwtPayload } from "jwt-decode";
import { baseCookieOptions } from "~/cookies/base-cookie-options";
import type { GoogleUser, IcmUser, Role, User } from "@agionoja/icm-shared";
import { redirectWithError, redirectWithSuccess } from "remix-toast";
import { fetchClient } from "~/fetch/fetch-client";
import { destroyUserDataCookie } from "~/cookies/user-cookie";

type SessionData = {
  token: string;
  role: keyof typeof Role;
};

type CreateSession = {
  request: Request;
  token: string;
  role: SessionData["role"];
  remember: boolean;
  redirectTo: string;
  message: string;
};

export const RoleRedirects = {
  USER: "/user/dashboard",
  ADMIN: "/admin/dashboard",
};

/**
 * Sets up session storage using cookies, ensuring secure management of session data.
 * - Use `baseCookieOptions` to configure secure session cookies.
 */
export const { destroySession, getSession, commitSession } =
  createCookieSessionStorage<SessionData>({
    cookie: {
      ...baseCookieOptions,
      name: "_session",
    },
  });

/**
 * getUserSession
 * Retrieves the current session object from the request cookies.
 *
 * @param request - The HTTP request containing the session cookie.
 * @returns A session object containing session data (or null if no valid session exists).
 */
export async function getUserSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return getSession(cookie);
}

/**
 * getToken
 * Extracts the JWT token from the user's session.
 *
 * @param request - The HTTP request containing the session cookie.
 * @returns The JWT token as a string (or null if not found).
 */
export async function getToken(request: Request) {
  return (await getUserSession(request)).get("token");
}

/**
 * Extracts the user role from the session.
 *
 * @param request - The HTTP request containing the session cookie.
 * @returns The user's role as a string (or null if not found).
 */
export async function getRole(request: Request) {
  return (await getUserSession(request)).get("role");
}

/**
 * Checks if a valid session exists by verifying the presence of a token and role in the session.
 *
 * @param request - The HTTP request containing the session cookie.
 * @returns A boolean indicating whether the user has a valid session.
 */
export async function hasSession(request: Request) {
  const token = await getToken(request);
  const role = await getRole(request);

  return !(!token || !role);
}

/**
 * Creates a new user session and sets it as a secure cookie.
 *
 * @param request - The current HTTP request.
 * @param token - The JWT token to be stored in the session.
 * @param role - The user's role to be stored in the session.
 * @param remember - Whether the session should persist beyond the current session.
 * @param redirectTo - The URL to redirect the user to after creating the session.
 * @param message - A success message to display after session creation.
 * @param init - (Optional) Additional response headers to include.
 * @returns A redirection response with the session cookie set in the headers.
 */
export async function createSession(
  {
    request,
    token,
    redirectTo,
    remember = false,
    message = "Welcome Back",
    role,
  }: CreateSession,
  init?: ResponseInit,
) {
  const session = await getUserSession(request);
  session.set("token", token);
  session.set("role", role);
  const maxAge = await getNestjsSessionMaxAgeInSeconds(token);

  const newHeaders = new Headers(init?.headers);
  newHeaders.append(
    "Set-Cookie",
    await commitSession(session, { maxAge: remember ? maxAge : undefined }),
  );

  return redirectWithSuccess(redirectTo, message, {
    headers: newHeaders,
  });
}

/**
 * Ensures a valid user session exists.
 * Redirects to the login page if the session is invalid.
 *
 * @param request - The current HTTP request.
 * @param redirectTo - The URL to redirect the user to after successful login.
 * @returns The user object retrieved from the session.
 * @throws Redirects to the login page if the session is invalid or the user is not authenticated.
 */
export async function requireUser(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const searchParams = new URLSearchParams([["redirect", redirectTo]]);
  const genericMsg = "Authorization required. Please log in and try again.";

  const redirectUrl =
    redirectTo && redirectTo !== "/"
      ? `/auth/login?${searchParams}`
      : "/auth/login";

  if (!(await hasSession(request))) {
    throw await redirectWithError(redirectUrl, genericMsg);
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
    if (exception.statusCode === 401) {
      throw await redirectWithError(redirectUrl, exception.message, {
        headers: {
          "Set-Cookie": await destroySession(await getUserSession(request)),
        },
      });
    }
    throw await redirectWithError(redirectUrl, exception.message);
  }

  if (!data?.user) throw await redirectWithError(redirectUrl, genericMsg);

  return data?.user;
}

/**
 * Restricts access to specific roles.
 *
 * @param user - The user object containing their role.
 * @param roles - An array of roles allowed to access the resource.
 * @throws Redirects to the appropriate dashboard if the user does not have the required role.
 */
export async function restrictTo(user: User, ...roles: User["role"][]) {
  if (!roles.includes(user.role)) {
    throw await redirectWithError(
      RoleRedirects[user.role],
      "You do not have permission to access this page",
    );
  }
}

/**
 * Logs the user out by invalidating their session and user cookie.
 *
 * @param request - The current HTTP request.
 * @param redirectTo - The URL to redirect the user to after logging out.
 * @param init - (Optional) Additional response headers to include.
 * @returns A redirection response with invalidated cookies set in the headers.
 */
export async function logout(
  request: Request,
  redirectTo = "/auth/login",
  init?: ResponseInit,
) {
  const headers = new Headers(init?.headers);
  const sessionCookie = await destroySession(await getUserSession(request));
  const userCookie = await destroyUserDataCookie();
  headers.append("Set-Cookie", sessionCookie);
  headers.append("Set-Cookie", userCookie);

  return redirect(redirectTo, {
    ...init,
    headers,
  });
}

/**
 * Extracts the payload from a JSON Web Token (JWT) provided as a string or within a request.
 *
 * @param requestOrToken - A `Request` object or a JWT string.
 * - If a `Request` is passed, the function extracts the token from the session.
 * - If a string is passed, it assumes the string is the token.
 *
 * @returns The decoded JWT payload as an object of type `JwtPayload` or `null` if:
 * - The token is invalid or absent.
 * - Decoding the token fails.
 */
export async function getJwtPayload(requestOrToken: Request | string) {
  const token =
    typeof requestOrToken === "string"
      ? requestOrToken
      : await getToken(requestOrToken);

  if (!token) return null;

  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
}

/**
 * Calculates the remaining time (in milliseconds) until the JWT session expires.
 *
 * @param requestOrToken - A `Request` object or a JWT string.
 * - If a `Request` is passed, the function extracts the token from the session.
 * - If a string is passed, it assumes the string is the token.
 *
 * @returns The remaining session duration in milliseconds.
 * - Returns `0` if the token is invalid or has already expired.
 */
export async function getNestjsSessionMaxAgeInMs(
  requestOrToken: Request | string,
) {
  return (await getNestjsSessionMaxAgeInSeconds(requestOrToken)) * 1000;
}

/**
 * Calculates the remaining time (in seconds) until the JWT session expires.
 *
 * @param requestOrToken - A `Request` object or a JWT string.
 * - If a `Request` is passed, the function extracts the token from the session.
 * - If a string is passed, it assumes the string is the token.
 *
 * @returns The remaining session duration in milliseconds.
 * - Returns `0` if the token is invalid or has already expired.
 */
export async function getNestjsSessionMaxAgeInSeconds(
  requestOrToken: Request | string,
) {
  const jwtPayload = await getJwtPayload(requestOrToken);
  const expire = jwtPayload?.exp ? jwtPayload.exp : 0;

  return Math.max(expire - Math.floor(Date.now() / 1000), 0);
}

/**
 * Checks whether the JWT session associated with a request or token has expired.
 *
 * @param requestOrToken - A `Request` object or a JWT string.
 * - If a `Request` is passed, the function extracts the token from the session.
 * - If a string is passed, it assumes the string is the token.
 *
 * @returns `true` if:
 * - The token is invalid, missing, or expired.
 * - The expiration (`exp`) claim in the JWT payload indicates the session has ended.
 *
 * Otherwise, returns are `false`.
 */
export async function hasNestJsSessionExpired(
  requestOrToken: Request | string,
) {
  const jwtPayload = await getJwtPayload(requestOrToken);
  const jwtExp = jwtPayload?.exp;

  if (!jwtExp) return true;

  return jwtExp * 1000 < Date.now();
}
