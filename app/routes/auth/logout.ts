import type { Route } from "./+types/logout";
import { getRole, getToken, logout, RoleRedirects } from "~/session";
import { redirect } from "react-router";
import { flashMessage } from "~/utils/flash-message";
import { SESSION_TIMEOUT_KEY, timeoutSession } from "~/toast/timeout-toast";
import { clearStorageAdapters, memoryAdapter } from "~/lib/cache/cache";

export async function action({ request }: Route.ActionArgs) {
  const { _action, ...values } = Object.fromEntries(await request.formData());

  switch (request.method) {
    case "POST": {
      switch (_action) {
        case SESSION_TIMEOUT_KEY: {
          const redirectTo = values?.redirectTo;
          const headers = await flashMessage({
            message: "Your session has timed out. Please log in again.",
            sessionStorage: timeoutSession,
          });
          return logout(request, String(redirectTo), {
            headers,
          });
        }
        default: {
          return logout(request);
        }
      }
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

export async function clientAction(args: Route.ClientActionArgs) {
  return clearStorageAdapters(args, {
    adapters: [localStorage, memoryAdapter],
  });
}

// This is a catch for when a user hits this route manually, which shouldn't happen often
export async function loader({ request }: Route.LoaderArgs) {
  const role = await getRole(request);
  const token = await getToken(request);
  if (!role || !token) return redirect("/");

  return redirect(RoleRedirects[role]);
}
