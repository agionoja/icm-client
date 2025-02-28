import type { Route } from "./+types/route";
import { AirtimePurchaseForm } from "~/routes/account/user/components/data-airtime-form";
import validator from "validator";
import { z } from "zod";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { AccountPadding } from "~/components/account-padding";
import { href, useFetcher } from "react-router";
import { throttleNetwork } from "~/utils/throttle-network";

export async function action({ request }: Route.LoaderArgs) {
  await throttleNetwork(Math.random() * (1.5 - 1) + 1);
  const formData = await request.formData();
  const parsedForm = z
    .object({
      phoneNumber: z.string(),
      network: z.enum(["mtn", "glo", "airtel", "etisalat"]),
      // amount: z.coerce.number(),
    })
    .parse(Object.fromEntries(formData));

  const isValid = validator.isMobilePhone(`${parsedForm.phoneNumber}`, "en-NG");

  return {
    message: isValid
      ? "Airtime purchase was successful!"
      : "Invalid phone number",
    error: !isValid,
  };
}

export default function RouteComponent() {
  const fetcherKey = href("/user/airtime");
  const fetcher = useFetcher<Route.ComponentProps["actionData"]>({
    key: fetcherKey,
  });

  useEffect(() => {
    if (fetcher.data) {
      toast(fetcher.data.message, {
        type: fetcher.data.error ? "error" : "success",
      });
    }
  }, [fetcher.data]);

  return (
    <AccountPadding>
      <AirtimePurchaseForm
        formProps={{
          action: href("/user/airtime"),
          fetcherKey,
        }}
        inputs={[
          {
            label: "Phone Number",
            inputProps: {
              placeholder: "Enter phone number",
              required: true,
              name: "phoneNumber",
              type: "tel",
            },
          },
          {
            label: "Amount to pay",
            inputProps: {
              placeholder: "Enter amount",
              required: true,
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
