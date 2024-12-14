import type { SessionStorage } from "react-router";

type FlashMessageOptions = {
  message: string;
  sessionStorage: SessionStorage<{ "flash-message": string }>;
};

export async function flashMessage(
  { message, sessionStorage }: FlashMessageOptions,
  headers?: Headers,
) {
  const session = await sessionStorage.getSession();
  session.flash("flash-message", message);

  const cookie = await sessionStorage.commitSession(session);
  const newHeaders = new Headers(headers);
  newHeaders.set("Set-Cookie", cookie);
  return newHeaders;
}

export function getSessionFromRequest(
  request: Request,
  { sessionStorage }: Pick<FlashMessageOptions, "sessionStorage">,
) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getFlashSession(
  request: Request,
  { sessionStorage }: Pick<FlashMessageOptions, "sessionStorage">,
) {
  const session = await getSessionFromRequest(request, { sessionStorage });
  const flash = session.get("flash-message");

  const headers = new Headers({
    "Set-Cookie": await sessionStorage.commitSession(session),
  });

  return { flash, headers };
}
