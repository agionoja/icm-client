import type { Route } from "./+types/spin-server";

export async function loader({ request }: Route.LoaderArgs) {
  return Response.json({ message: "Spinning server" });
}
