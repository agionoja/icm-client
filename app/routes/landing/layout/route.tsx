import type { Route } from "./+types/route";
import { Header } from "~/routes/landing/components/header";
import { Outlet } from "react-router";
import { hasSession } from "~/session";

export async function loader({ request }: Route.LoaderArgs) {
  const isLoggedIn = await hasSession(request);

  return { isLoggedIn };
}
export default function Layout({
  loaderData: { isLoggedIn },
}: Route.ComponentProps) {
  return (
    <div className={"px-5 md:px-28"}>
      <Header isLoggedIn={isLoggedIn} />
      <Outlet />
    </div>
  );
}
