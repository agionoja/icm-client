import type { Route } from "./+types/s";

export async function loader({ request }: Route.LoaderArgs) {
  return Response.json({ message: "Spinning server" });
}
