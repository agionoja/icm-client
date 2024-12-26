import type { Route } from "./+types/route";
import { redirect } from "react-router";
import { settingsRouteConfig } from "~/routes.config";

export async function loader({ request }: Route.LoaderArgs) {
  return redirect(settingsRouteConfig.personalInfo.getPath);
}
