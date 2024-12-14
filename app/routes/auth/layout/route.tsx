import { Link, Outlet, redirect } from "react-router";
import logo from "~/assets/logos/SVG/Primary Logo - Full Color.svg";
import type { Route } from "./+types/route";
import { getRole, getToken, hasSession, RoleRedirects } from "~/session";
import type { User } from "@agionoja/icm-shared";

export default function AuthLayout() {
  return (
    <div
      className={
        "ld:py-20 flex h-screen min-h-[900px] items-center justify-center bg-white bg-auth-pattern-mobile bg-contain bg-top bg-no-repeat px-4 text-black md:bg-auth-pattern-desktop lg:px-28"
      }
    >
      <div
        className={
          "flex w-full flex-col-reverse justify-center gap-20 lg:flex-row lg:justify-between"
        }
      >
        <Link className={"lg:mt-auto"} to={"/"}>
          <img src={logo} height={50} width={182} alt="ICM Tech logo" />
        </Link>
        <Outlet />
      </div>
    </div>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  // Check if the user has a valid session
  const isLoggedIn = await hasSession(request);
  if (!isLoggedIn) {
    return null; // Let unauthenticated users proceed
  }

  // Retrieve token and role (skip if session already deemed invalid)
  const token = await getToken(request);
  const role = (await getRole(request)) as User["role"];
  if (!token || !role) {
    return null; // Edge case: corrupted session
  }

  // Determine the redirect path
  const url = new URL(request.url);
  const refererUrl = new URL(request.headers.get("referer") || request.url);
  const searchParams = new URLSearchParams(url.search);

  const redirectPath = searchParams.get("redirect");

  // Prevent infinite redirection loops
  if (refererUrl.pathname !== url.pathname) {
    return redirect(refererUrl.pathname);
  }

  // Handle the redirect path query parameter
  if (redirectPath) {
    return redirect(redirectPath);
  }

  // Redirect logged-in users based on role
  const roleRedirect = RoleRedirects[role];
  if (roleRedirect) {
    return redirect(roleRedirect);
  }

  // Default fallback for logged-in users
  return redirect("/");
}
