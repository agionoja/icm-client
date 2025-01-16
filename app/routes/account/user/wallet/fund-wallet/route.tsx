import type { Route } from "./+types/route";
import { Form, redirect, useNavigation } from "react-router";
import { fetchClient, type ResponseKey } from "~/fetch/fetch-client.server";
import { getToken, restrictTo } from "~/session";
import { Button } from "~/components/ui/button";
import { Role } from "icm-shared";
import { Input } from "~/components/ui/input";

export async function action({ request }: Route.ActionArgs) {
  const token = await getToken(request);
  const formData = await request.formData();
  const amount = formData.get("amount");
  const response = await fetchClient<string, ResponseKey<"topUpUrl">>(
    "/transactions/wallet/fund-wallet/initialize",
    {
      responseKey: "topUpUrl",
      token,
      method: "POST",
      body: JSON.stringify({ amount }),
    },
  );

  if (response.exception) {
    return response.exception;
  }

  throw redirect(response.data.topUpUrl);
}

export async function loader({ request }: Route.LoaderArgs) {
  await restrictTo(request, Role.USER);
}

export default function TopUp() {
  const { state } = useNavigation();

  return (
    <Form method="POST">
      <Input
        required
        width={200}
        type="number"
        name="amount"
        placeholder="Amount"
        min={100}
        step={100}
      />
      <Button type="submit" disabled={state !== "idle"}>
        {state === "submitting" ? "Redirecting to payment..." : "Fund wallet"}
      </Button>
    </Form>
  );
}
