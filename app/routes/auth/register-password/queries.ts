import type { Register } from "~/cookies/registration-multi-step-form";
import { fetchClient } from "~/fetch/fetch-client";

export async function register(registerDto: Register) {
  return await fetchClient("/auth/register", {
    responseKey: "data",
    body: JSON.stringify(registerDto),
    method: "POST",
  });
}
