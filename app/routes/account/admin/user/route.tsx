import type { Route } from "./+types/route";
import { fetchClient, type ResponseKey } from "~/fetch/fetch-client.server";
import type { UserUnion } from "icm-shared";
import { getToken } from "~/session";
import {
  cacheClientLoader,
  CacheProvider,
  type MutableRevalidate,
} from "~/lib/cache";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { data } from "react-router";

export async function loader({ request, params }: Route.LoaderArgs) {
  const token = await getToken(request);
  const response = await fetchClient<UserUnion, ResponseKey<"user">>(
    `/users/${params.id}`,
    {
      token,
      responseKey: "user",
      query: {
        ignoreFilterFlags: ["isActive"],
        select: ["+isActive", "+isVerified", "+isSuspended"],
      },
    },
  );

  if (response.exception?.statusCode === 404) {
    throw new Response(null, {
      status: 404,
      statusText: response.exception.message,
    });
  }

  if (response.exception) {
    return data(response, {
      status: response.exception.statusCode,
      statusText: response.exception.message,
    });
  }

  return response;
}

const mutableRevalidate: MutableRevalidate = { revalidate: false };
export async function clientLoader(args: Route.ClientLoaderArgs) {
  return cacheClientLoader(args, {
    maxAge: 60,
    revalidate: mutableRevalidate.revalidate,
  });
}

clientLoader.hydrate = true as const;

function UserContent({ loaderData }: Pick<Route.ComponentProps, "loaderData">) {
  const error = loaderData.exception;
  useEffect(() => {
    if (error) {
      toast(error.message, { type: "error" });
    }
  }, [error]);

  return (
    <div>
      <span>{loaderData.data?.user.firstname}</span>
    </div>
  );
}
export default function User({ loaderData }: Route.ComponentProps) {
  return (
    <CacheProvider loaderData={loaderData}>
      {(cachedData) => <UserContent loaderData={cachedData} />}
    </CacheProvider>
  );
}
