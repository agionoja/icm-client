import { fetchClient } from "~/fetch/fetch-client";
import { User, LoginDto } from "@agionoja/icm-shared";

export async function login(loginDto: LoginDto) {
  const { data: userToken, exception: userTokenException } = await fetchClient<
    string,
    "accessToken"
  >("/auth/login", {
    responseKey: "accessToken",
    method: "POST",
    body: JSON.stringify(loginDto),
  });

  const { data: profile, exception: profileException } = await fetchClient<
    User,
    "user"
  >("/auth/profile", {
    responseKey: "user",
    token: userToken?.accessToken,
  });

  return { userToken, userTokenException, profile, profileException };
}
