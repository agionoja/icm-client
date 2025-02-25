import { fetchClient, type ResponseKey } from "~/fetch/fetch-client.server";
import type { UserUnion } from "icm-shared";

export async function getUser(id: string, token?: string) {
  return fetchClient<UserUnion, ResponseKey<"user">>(`/users/${id}`, {
    token,
    responseKey: "user",
    query: {
      ignoreFilterFlags: ["isActive"],
      select: ["+isActive", "+isVerified", "+isSuspended"],
    },
  });
}
