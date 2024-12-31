import type { Route } from "./+types/route";
import { Header } from "~/routes/landing/components/header";
import { Outlet } from "react-router";
import { getRole, hasSession, RoleRedirects } from "~/session";
import type { Role } from "icm-shared";

export async function loader({ request }: Route.LoaderArgs) {
  const isLoggedIn = await hasSession(request);
  if (isLoggedIn) {
    const role = (await getRole(request)) as Role;
    return { isLoggedIn, roleRedirectUrl: RoleRedirects[role] };
  }

  return { isLoggedIn, roleRedirectUrl: undefined };
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  return (
    <div className={"px-5 md:px-28"}>
      <Header
        roleRedirectUrl={loaderData?.roleRedirectUrl}
        isLoggedIn={loaderData.isLoggedIn}
      />
      <Outlet />
    </div>
  );
}
