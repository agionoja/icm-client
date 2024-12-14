import type { Route } from "./+types/logout";
import { getRole, getToken, logout } from "~/session";
import { redirect } from "react-router";
import { flashMessage } from "~/utils/flash-message";
import { SESSION_TIMEOUT_KEY, timeoutSession } from "~/toast/timeout-toast";
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  switch (request.method) {
    case "POST": {
      const sessionTimeout = formData.get(SESSION_TIMEOUT_KEY);
      const redirectTo = formData.get("redirectTo");
      if (sessionTimeout) {
        const headers = await flashMessage({
          message: "Your session has timed out. Please log in again.",
          sessionStorage: timeoutSession,
        });

        return logout(request, `/auth/login?${redirectTo ?? ""}`, {
          headers,
        });
      }

      return logout(request);
    }
    default: {
      return Response.json(
        {
          message: `This route that does not handle the ${request.method} method`,
        },
        { status: 500 },
      );
    }
  }
}
// This is a catch for when a user hits this route manually, which shouldn't happen often
export async function loader({ request }: Route.LoaderArgs) {
  const role = await getRole(request);
  const token = await getToken(request);
  if (!role || !token) return redirect("/");

  const redirectTo = role === "USER" ? "/user/dashboard" : "/admin/dashboard";
  return redirect(redirectTo);
}
