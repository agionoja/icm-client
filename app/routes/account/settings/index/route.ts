import type { Route } from "./+types/route";
import { href, redirect } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  return redirect(href("/settings/personal-info"));
}
