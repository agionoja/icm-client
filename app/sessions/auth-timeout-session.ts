import { createCookieSessionStorage } from "react-router";
import { baseCookieOptions } from "~/cookies/base-cookie-options";

export type SessionTimeoutMessage = {
  message: string;
};

export const SESSION_TIMEOUT = "session-timeout";

const { destroySession, getSession, commitSession } =
  createCookieSessionStorage<SessionTimeoutMessage>({
    cookie: {
      ...baseCookieOptions,
      name: SESSION_TIMEOUT,
    },
  });

export async function getTimeoutMessageSession(request: Request) {
  const cookies = request.headers.get("Cookie");
  return getSession(cookies);
}

export async function destroyTimeoutMessageSession(request: Request) {
  const session = await getTimeoutMessageSession(request);

  return destroySession(session);
}

export async function commitTimeoutMessageSession(
  request: Request,
  message = "Your session has timed out. Please log in again.",
) {
  const session = await getTimeoutMessageSession(request);
  session.set("message", message);
  return commitSession(session);
}
