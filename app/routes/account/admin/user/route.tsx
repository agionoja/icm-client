import type { Route } from "./+types/route";
import { getToken } from "~/session";
import {
  cacheClientLoader,
  CacheProvider,
  type MutableRevalidate,
} from "~/lib/cache";
import { data } from "react-router";
import { getUser } from "~/routes/account/admin/user/query";
import { useRouteComponentErrorToast } from "~/hooks/useRouteComponentErrorToast";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Admin - User Details" },
    {
      name: "description",
      content:
        "View detailed information about a specific user, including profile details, assigned roles, and account status.",
    },
  ];
};

export async function loader({ request, params }: Route.LoaderArgs) {
  const token = await getToken(request);
  const response = await getUser(params.id, token);

  if (response.exception?.statusCode === 404) {
    throw new Response(null, {
      status: 404,
      statusText: response.exception.message,
    });
  }

  if (response.exception) {
    return data(
      { response },
      {
        status: response.exception.statusCode,
        statusText: response.exception.message,
      },
    );
  }

  return { response };
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
  useRouteComponentErrorToast(loaderData.response.exception);

  return (
    <div>
      <span>{loaderData.response.data?.user.firstname}</span>
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
