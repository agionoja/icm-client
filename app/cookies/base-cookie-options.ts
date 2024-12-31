import type { CookieOptions } from "react-router";
import { envConfig } from "~/env-config.server";

export const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: envConfig(process.env).NODE_ENV === "production",
  path: "/",
  sameSite: "lax",
  secrets: [envConfig(process.env).SESSION_SECRET],
};

export function getCookieFromHeader(request: Request) {
  return request.headers.get("Cookie");
}
