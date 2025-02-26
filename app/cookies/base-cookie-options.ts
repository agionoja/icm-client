import type { CookieOptions } from "react-router";
import { env } from "~/env-config.server";

export const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  path: "/",
  sameSite: "lax",
  secrets: [env.SESSION_SECRET],
};

export function getCookieFromHeader(request: Request) {
  return request.headers.get("Cookie");
}
