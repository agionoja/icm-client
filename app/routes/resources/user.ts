import type { Route } from "./+types/user";

export async function action({ request, params }: Route.LoaderArgs) {
  console.log(params);
  switch (request.method) {
    case "DELETE": {
    }
    case "PATCH": {
    }
  }
}
