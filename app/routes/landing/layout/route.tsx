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
    <div className={"min-h-screen flex flex-col"}>
      <Header
        roleRedirectUrl={loaderData?.roleRedirectUrl}
        isLoggedIn={loaderData.isLoggedIn}
      />
      <Outlet />
       {/* Image Footer */}
       <div className="relative mt-[180px]">
       <img className="absolute z-[2] bottom-[-300px] " src="/landing/image-footer.png" alt="" />
      <footer className="absolute bg-[#151515] h-[395px] w-full z-[10]"> 
        Hello 
      </footer>
      </div>
    </div>
  );
}
