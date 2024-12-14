import { createCookieSessionStorage } from "react-router";
import { baseCookieOptions } from "~/cookies/base-cookie-options";

export const SESSION_TIMEOUT_KEY = "session-timeout";

export const timeoutSession = createCookieSessionStorage({
  cookie: {
    ...baseCookieOptions,
    name: SESSION_TIMEOUT_KEY,
  },
});
