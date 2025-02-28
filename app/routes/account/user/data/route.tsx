import type { Route } from "./+types/route";
import {
  type DataPlan,
  DataPurchaseForm,
} from "~/routes/account/user/components/data-airtime-form";
import validator from "validator";
import { z } from "zod";
import { useEffect, useState } from "react";
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
    message: isValid ? "Data purchase was successful!" : "Invalid phone number",
    error: !isValid,
  };
}

export async function loader({ request }: Route.LoaderArgs) {
  const dataPlan: DataPlan[] = [
    { id: "1", name: "1GB Daily", price: 500 },
    { id: "2", name: "5GB Weekly", price: 1500 },
    { id: "3", name: "10GB Monthly", price: 3000 },
  ];

  return { dataPlan };
}

export default function RouteComponent({ loaderData }: Route.ComponentProps) {
  const [dataPlan, setDataPlan] = useState<DataPlan | undefined>();
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
      <DataPurchaseForm
        formProps={{
          fetcherKey,
        }}
        dataPlans={loaderData.dataPlan}
        getSelectedDataPlan={(dataPlanId: string) => {
          setDataPlan(
            loaderData.dataPlan.find((plan) => plan.id === dataPlanId),
          );
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
              defaultValue: dataPlan?.price,
              readOnly: true,
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
