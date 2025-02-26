import type { Route } from "./+types/route";
import { DataAirtimeForm } from "~/routes/account/user/components/data-airtime-form";
import { throttleNetwork } from "~/utils/throttle-network";
import validator from "validator";
import { z } from "zod";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { AccountPadding } from "~/components/account-padding";

export async function action({ request }: Route.LoaderArgs) {
  // await throttleNetwork(Math.random() * (4 - 3) + 3);
  await throttleNetwork(0);
  const formData = z
    .object({ phoneNumber: z.string() })
    .parse(Object.fromEntries(await request.formData()));

  const isValid = validator.isMobilePhone(`${formData.phoneNumber}`, "en-NG");

  console.log(!isValid);
  return {
    message: isValid
      ? "Airtime purchase was successful!"
      : "Invalid phone number",
    error: !isValid,
  };
}

export default function RouteComponent({ actionData }: Route.ComponentProps) {
  useEffect(() => {
    console.log(actionData);
    if (actionData) {
      toast(actionData.message, {
        type: actionData.error ? "error" : "success",
      });
    }
  }, [actionData]);

  return (
    <AccountPadding>
      <DataAirtimeForm
        inputs={[
          {
            label: "Phone Number",
            inputProps: {
              placeholder: "Enter amount",
              name: "phoneNumber",
              type: "tel",
            },
          },
          {
            label: "Amount to pay",
            inputProps: {
              placeholder: "Enter amount",
              name: "amount",
              type: "number",
              min: 100,
              max: 100_000,
              step: 100,
            },
          },
        ]}
      />
    </AccountPadding>
  );
}
