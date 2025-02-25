import type { Route } from "./+types/route";
import { DataAirtimeForm } from "~/routes/account/user/components/data-airtime-form";
import { throttleNetwork } from "~/utils/throttle-network";
import validator from "validator";
import { z } from "zod";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { Loading } from "~/components/loading";
import { useFetcher } from "react-router";

export async function action({ request }: Route.LoaderArgs) {
  await throttleNetwork(Math.random() * (4 - 3) + 3);
  const formData = z
    .object({ phoneNumber: z.string() })
    .parse(Object.fromEntries(await request.formData()));

  const isValid = validator.isMobilePhone(`${formData.phoneNumber}`, "en-NG");

  console.log(formData);
  return {
    message: isValid
      ? "Airtime purchase was successful!"
      : "Invalid phone number",
    error: isValid,
  };
}

export default function RouteComponent({ actionData }: Route.ComponentProps) {
  useEffect(() => {
    if (actionData) {
      toast(actionData.message, {
        type: actionData.error ? "success" : "error",
      });
    }
  }, [actionData]);

  return (
    <>
      <DataAirtimeForm />
    </>
  );
}
