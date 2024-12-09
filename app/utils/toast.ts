import { createCookieSessionStorage, redirect } from "react-router";
import { baseCookieOptions } from "~/cookies/base-cookie-options";
import { z } from "zod";
import { TypeOptions } from "react-toastify";

const toastMessageSchema = z.object({
  message: z.string(),
  type: z.custom<TypeOptions>(),
});

const flashSessionValuesSchema = z.object({
  toast: toastMessageSchema.optional(),
});

type FlashSessionValues = z.infer<typeof flashSessionValuesSchema>;

type ToastMessage = z.infer<typeof toastMessageSchema>;

const FLASH_SESSION = "__flash";

export const flashSessionStorage = createCookieSessionStorage<{
  [FLASH_SESSION]: FlashSessionValues;
}>({
  cookie: {
    ...baseCookieOptions,
    name: FLASH_SESSION,
  },
});

export function getSessionFromRequest(request: Request) {
  const cookie = request.headers.get("Cookie");
  return flashSessionStorage.getSession(cookie);
}

export async function getFlashSession(request: Request) {
  const session = await getSessionFromRequest(request);
  const result = flashSessionValuesSchema.safeParse(session.get(FLASH_SESSION));
  const flash = result.success ? result.data : undefined;

  const headers = new Headers({
    "Set-Cookie": await flashSessionStorage.commitSession(session),
  });

  return { flash, headers };
}

export async function flashMessage(
  flash: FlashSessionValues,
  headers?: ResponseInit["headers"],
) {
  const session = await flashSessionStorage.getSession();

  session.flash(FLASH_SESSION, flash);

  const cookie = await flashSessionStorage.commitSession(session);

  const newHeaders = new Headers(headers);
  newHeaders.set("Set-Cookie", cookie);

  return newHeaders;
}

export async function redirectWithFlash(
  url: string,
  flash: FlashSessionValues,
  init?: ResponseInit,
) {
  // Create a new Headers object, using init.headers if provided
  const headers = new Headers(init?.headers);

  // Add the flash message cookie to the headers
  const flashHeaders = await flashMessage(flash, headers);

  console.log({ flashHeaders });

  // Construct the redirect with merged headers
  return redirect(url, {
    ...init,
    headers: flashHeaders,
  });
}

export function redirectWithToast(
  url: string,
  toast: ToastMessage,
  init?: ResponseInit,
) {
  return redirectWithFlash(url, { toast }, init);
}

export function redirectWithErrorToast(
  url: string,
  message: string,
  init?: ResponseInit,
) {
  return redirectWithToast(url, { message, type: "error" }, init);
}

export function redirectWithSuccessToast(
  url: string,
  message: string,
  init?: ResponseInit,
) {
  return redirectWithToast(url, { message, type: "success" }, init);
}

export function redirectWithInfoToast(
  url: string,
  message: string,
  init?: ResponseInit,
) {
  return redirectWithToast(url, { message, type: "info" }, init);
}
