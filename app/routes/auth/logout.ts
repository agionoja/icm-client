import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "react-router";
import { getRole, getToken, logout } from "~/session";

export async function action({ request }: ActionFunctionArgs) {
  switch (request.method) {
    case "POST": {
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
export async function loader({ request }: LoaderFunctionArgs) {
  const role = await getRole(request);
  const token = await getToken(request);
  if (!role || !token) return redirect("/");

  const redirectTo = role === "USER" ? "/user/dashboard" : "/admin/dashboard";
  return redirect(redirectTo);
}
