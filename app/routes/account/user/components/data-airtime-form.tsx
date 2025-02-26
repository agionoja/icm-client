import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import EtisalatLogo from "~/assets/icons/9mobile-logo.png";
import AirtelLogo from "~/assets/icons/airtel-logo-white-text-vertical.jpg";
import MTNLogo from "~/assets/icons/mtn-logo.svg";
import GLOLogo from "~/assets/icons/Globacom-Limited-Logo 1.svg";
import { Form, type FormProps } from "react-router";
import { Label } from "~/components/ui/label";
import type React from "react";
import { cn } from "~/lib/utils";

export const networkProvider = [
  {
    alt: "Airtel",
    src: AirtelLogo,
    name: "airtel",
  },
  {
    alt: "MTN",
    src: MTNLogo,
    name: "mtn",
  },
  {
    alt: "9mobile",
    src: EtisalatLogo,
    name: "etisalat",
  },
  {
    alt: "Glo",
    src: GLOLogo,
    name: "glo",
  },
] as const;

function NetworkSelect() {
  return (
    <Label className="flex flex-col gap-3 2xl:gap-4 text-sm font-medium text-gray-500 mb-1">
      <span>Network</span>
      <Select required>
        <SelectTrigger className="w-full border-gray-100 rounded-md shadow-sm focus:ring-1 focus:ring-gray-300">
          <SelectValue placeholder="Select Network" />
        </SelectTrigger>
        <SelectContent className={"z-50 bg-gray-50"}>
          {networkProvider.map(({ name, src, alt }, index) => (
            <SelectItem key={index} value={name}>
              <input type="text" hidden name={name} defaultValue={name} />
              <div className="flex items-center capitalize">
                <img
                  src={src}
                  height={20}
                  width={20}
                  alt={alt}
                  className="mr-2 rounded-sm"
                />
                {name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Label>
  );
}

function TypeSelect() {
  return (
    <Label className="flex flex-col gap-3 2xl:gap-4 text-sm font-medium text-gray-500 mb-1">
      <span>Type</span>
      <Select required>
        <SelectTrigger className="w-full border-gray-200 rounded-md shadow-sm focus:ring-1 focus:ring-gray-200">
          <SelectValue placeholder="VTU" />
        </SelectTrigger>
        <SelectContent className={"z-50 bg-gray-50"}>
          <SelectItem defaultChecked value="vtu">
            VTU
            <input type="text" hidden name={"vtu"} />
          </SelectItem>
        </SelectContent>
      </Select>
    </Label>
  );
}

interface Props {
  inputs: {
    label: string;
    labelProps?: React.ComponentProps<"label">;
    inputProps: React.ComponentProps<"input">;
  }[];
  formProps?: FormProps;
  btnProps?: React.ComponentProps<"button">;
}

function Inputs({ inputs }: Pick<Props, "inputs">) {
  return inputs.map(
    ({ labelProps: { className, ...rest } = {}, inputProps, label }, i) => (
      <Label
        key={i}
        className={cn(
          "flex flex-col gap-4 text-sm font-medium text-gray-500",
          className,
        )}
        {...rest}
      >
        <span>{label}</span>
        <Input {...inputProps} />
      </Label>
    ),
  );
}

export function DataAirtimeForm({ inputs, formProps = {}, btnProps }: Props) {
  // const { Form, state } = useFetcher();
  return (
    <Form
      method={"POST"}
      className="max-w-lg 2xl::max-w-xl flex flex-col gap-5 2xl:gap-4 p-6 bg-white rounded-lg shadow-sm"
      {...formProps}
    >
      <NetworkProviders />
      <NetworkSelect />
      <TypeSelect />
      <Inputs inputs={inputs} />

      <Button type={"submit"} className="w-32 ml-auto" {...btnProps}>
        Proceed to Pay
      </Button>
    </Form>
  );
}

function NetworkProviders() {
  return (
    <div className={"flex gap-4 mx-auto md:mr-auto md:mx-0 mb-4"}>
      {networkProvider.map(({ alt, src }, index) => (
        <img
          key={index}
          src={src}
          height={40}
          width={40}
          alt={alt}
          className="rounded-md h-10 w-10"
        />
      ))}
    </div>
  );
}
