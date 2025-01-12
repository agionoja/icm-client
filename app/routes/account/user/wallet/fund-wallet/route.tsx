import type { Route } from "./+types/route";
import { Form, redirect } from "react-router";
import { fetchClient, type ResponseKey } from "~/fetch/fetch-client.server";
import { getToken } from "~/session";
import { Button } from "~/components/ui/button";
import type { IWalletTopUpTransaction } from "icm-shared";

export async function action({ request }: Route.ActionArgs) {
  const token = await getToken(request);
  const response = await fetchClient<string, ResponseKey<"topUpUrl">>(
    "/transactions/wallet/fund-wallet/initialize",
    {
      responseKey: "topUpUrl",
      token,
      method: "POST",
      body: JSON.stringify({ amount: 10 }),
    },
  );

  if (response.exception) {
    return response.exception;
  }

  throw redirect(response.data.topUpUrl);
}

export async function loader({ request }: Route.LoaderArgs) {
  await fetchClient<IWalletTopUpTransaction, ResponseKey<"transaction">>(
    "/transactions/wallet/verify/12345",
    { responseKey: "transaction" },
  );
}

export default function TopUp() {
  return (
    <>
      <Form method={"POST"}>
        <Button type={"submit"}>Fund Account</Button>
      </Form>
    </>
  );
}
