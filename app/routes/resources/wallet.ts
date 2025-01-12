import type { Route } from "./+types/wallet";
import { fetchClient, type ResponseKey } from "~/fetch/fetch-client.server";
import { getToken, requireUser, restrictTo } from "~/session";
import { type IWalletTopUpTransaction, Role } from "icm-shared";
import { redirectWithError, redirectWithSuccess } from "remix-toast";
import { userRouteConfig } from "~/routes.config";

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireUser(request);
  await restrictTo(request, Role.USER);
  const token = await getToken(request);
  const { exception, message, data } = await fetchClient<
    IWalletTopUpTransaction,
    ResponseKey<"transaction">
  >(`/transactions/wallet/verify/${params.reference}`, {
    responseKey: "transaction",
    token,
  });

  if (exception) {
    console.log(exception);
    throw await redirectWithError(
      userRouteConfig.fundWallet.getPath,
      exception.message,
    );
  }

  console.log(data);

  throw await redirectWithSuccess(
    userRouteConfig.fundWallet.getPath,
    message || "Account funded successfully.",
  );
}
