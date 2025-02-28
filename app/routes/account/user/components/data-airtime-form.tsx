// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "~/components/ui/select";
// import { Input } from "~/components/ui/input";
// import { Button } from "~/components/ui/button";
// import { Label } from "~/components/ui/label";
// import { useFetcher, type FormProps } from "react-router";
// import { cn } from "~/lib/utils";
// import type React from "react";
// import EtisalatLogo from "~/assets/icons/9mobile-logo.png";
// import AirtelLogo from "~/assets/icons/airtel-logo-white-text-vertical.jpg";
// import MTNLogo from "~/assets/icons/mtn-logo.svg";
// import GLOLogo from "~/assets/icons/Globacom-Limited-Logo 1.svg";
// import { Loading } from "~/components/loading";
//
// // Define network providers as a constant
// export const NETWORK_PROVIDERS = [
//   { alt: "Airtel", src: AirtelLogo, name: "airtel" },
//   { alt: "MTN", src: MTNLogo, name: "mtn" },
//   { alt: "9mobile", src: EtisalatLogo, name: "etisalat" },
//   { alt: "Glo", src: GLOLogo, name: "glo" },
// ] as const;
//
// export type NetworkProvider = (typeof NETWORK_PROVIDERS)[number];
//
// // Reusable labeled select component
// const LabeledSelect: React.FC<{
//   label: string;
//   children: React.ReactNode;
//   className?: string;
// }> = ({ label, children, className }) => (
//   <Label
//     className={cn(
//       "flex flex-col gap-3 2xl:gap-4 text-sm font-medium text-gray-500 mb-1",
//       className,
//     )}
//   >
//     <span>{label}</span>
//     {children}
//   </Label>
// );
//
// // Network selection component
// const NetworkSelect: React.FC = () => (
//   <LabeledSelect label="Network">
//     <Select required>
//       <SelectTrigger className="w-full border-gray-100 rounded-md shadow-sm focus:ring-1 focus:ring-gray-300">
//         <SelectValue placeholder="Select Network" />
//       </SelectTrigger>
//       <SelectContent className="z-50 bg-gray-50">
//         {NETWORK_PROVIDERS.map(({ name, src, alt }, index) => (
//           <SelectItem key={index} value={name}>
//             <input type="text" hidden name={"network"} defaultValue={name} />
//             <div className="flex items-center capitalize">
//               <img
//                 src={src}
//                 height={20}
//                 width={20}
//                 alt={alt}
//                 className="mr-2 rounded-sm"
//               />
//               {name}
//             </div>
//           </SelectItem>
//         ))}
//       </SelectContent>
//     </Select>
//   </LabeledSelect>
// );
//
// // Type selection component (could be expanded if more types are added)
// const TypeSelect: React.FC = () => (
//   <LabeledSelect label="Type">
//     <Select required>
//       <SelectTrigger className="w-full border-gray-200 rounded-md shadow-sm focus:ring-1 focus:ring-gray-200">
//         <SelectValue placeholder="VTU" />
//       </SelectTrigger>
//       <SelectContent className="z-50 bg-gray-50">
//         <SelectItem defaultChecked value="vtu">
//           VTU
//           <input type="text" hidden name="vtu" />
//         </SelectItem>
//       </SelectContent>
//     </Select>
//   </LabeledSelect>
// );
//
// // Reusable input component
// const FormInput: React.FC<{
//   label: string;
//   inputProps: React.ComponentProps<"input">;
//   labelProps?: React.ComponentProps<"label">;
// }> = ({ label, inputProps, labelProps = {} }) => (
//   <Label
//     className={cn(
//       "flex flex-col gap-4 text-sm font-medium text-gray-500",
//       labelProps.className,
//     )}
//     {...labelProps}
//   >
//     <span>{label}</span>
//     <Input {...inputProps} />
//   </Label>
// );
//
// // Network providers display component
// const NetworkProviders: React.FC = () => (
//   <div className="flex gap-4 mx-auto md:mr-auto md:mx-0 mb-4">
//     {NETWORK_PROVIDERS.map(({ alt, src }, index) => (
//       <img
//         key={index}
//         src={src}
//         height={40}
//         width={40}
//         alt={alt}
//         className="rounded-md h-10 w-10"
//       />
//     ))}
//   </div>
// );
//
// // Main form component
// interface DataAirtimeFormProps {
//   inputs: {
//     label: string;
//     labelProps?: React.ComponentProps<"label">;
//     inputProps: React.ComponentProps<"input">;
//   }[];
//   formProps?: FormProps;
//   btnProps?: React.ComponentProps<"button">;
// }
//
// export const DataAirtimeForm: React.FC<DataAirtimeFormProps> = ({
//   inputs,
//   formProps = {},
//   btnProps,
// }) => {
//   const { Form, state } = useFetcher({ key: formProps.fetcherKey });
//
//   return (
//     <Form
//       method="POST"
//       className="max-w-lg 2xl:max-w-xl flex flex-col gap-8 p-6 bg-white rounded-lg shadow-sm"
//       {...formProps}
//     >
//       <Loading loading={state === "submitting"} variant={"page"} />
//       <NetworkProviders />
//       <NetworkSelect />
//       <TypeSelect />
//       {inputs.map((input, index) => (
//         <FormInput key={index} {...input} />
//       ))}
//       <Button
//         disabled={state === "submitting"}
//         type="submit"
//         className="w-32 ml-auto bg-sidebar-accent"
//         {...btnProps}
//       >
//         Proceed to Pay
//       </Button>
//     </Form>
//   );
// };

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { useFetcher, type FormProps } from "react-router";
import { cn } from "~/lib/utils";
import React from "react";
import EtisalatLogo from "~/assets/icons/9mobile-logo.png";
import AirtelLogo from "~/assets/icons/airtel-logo-white-text-vertical.jpg";
import MTNLogo from "~/assets/icons/mtn-logo.svg";
import GLOLogo from "~/assets/icons/Globacom-Limited-Logo 1.svg";
import { Loading } from "~/components/loading";

// Define network providers as a constant
export const NETWORK_PROVIDERS = [
  { alt: "Airtel", src: AirtelLogo, name: "airtel" },
  { alt: "MTN", src: MTNLogo, name: "mtn" },
  { alt: "9mobile", src: EtisalatLogo, name: "etisalat" },
  { alt: "Glo", src: GLOLogo, name: "glo" },
] as const;

export type NetworkProvider = (typeof NETWORK_PROVIDERS)[number];

// Reusable labeled select component
const LabeledSelect: React.FC<{
  label: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, children, className }) => (
  <Label
    className={cn(
      "flex flex-col gap-3 2xl:gap-4 text-sm font-medium text-gray-500 mb-1",
      className,
    )}
  >
    <span>{label}</span>
    {children}
  </Label>
);

// Network selection component
const NetworkSelect: React.FC = () => (
  <LabeledSelect label="Network">
    <Select required>
      <SelectTrigger className="w-full border-gray-100 rounded-md shadow-sm focus:ring-1 focus:ring-gray-300">
        <SelectValue placeholder="Select Network" />
      </SelectTrigger>
      <SelectContent className="z-50 bg-gray-50">
        {NETWORK_PROVIDERS.map(({ name, src, alt }, index) => (
          <SelectItem key={index} value={name}>
            <input type="text" hidden name={"network"} defaultValue={name} />
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
  </LabeledSelect>
);

// Type selection component
const TypeSelect: React.FC = () => (
  <LabeledSelect label="Type">
    <Select required>
      <SelectTrigger className="w-full border-gray-200 rounded-md shadow-sm focus:ring-1 focus:ring-gray-200">
        <SelectValue placeholder="VTU" />
      </SelectTrigger>
      <SelectContent className="z-50 bg-gray-50">
        <SelectItem defaultChecked value="vtu">
          VTU
          <input type="text" hidden name="vtu" />
        </SelectItem>
      </SelectContent>
    </Select>
  </LabeledSelect>
);

// Reusable input component
const FormInput: React.FC<{
  label: string;
  inputProps: React.ComponentProps<"input">;
  labelProps?: React.ComponentProps<"label">;
}> = ({ label, inputProps, labelProps = {} }) => (
  <Label
    className={cn(
      "flex flex-col gap-4 text-sm font-medium text-gray-500",
      labelProps.className,
    )}
    {...labelProps}
  >
    <span>{label}</span>
    <Input {...inputProps} />
  </Label>
);

// Network providers display component
const NetworkProviders: React.FC = () => (
  <div className="flex gap-4 mx-auto md:mr-auto md:mx-0 mb-4">
    {NETWORK_PROVIDERS.map(({ alt, src }, index) => (
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

// AirtimePurchaseForm (your original code, renamed)
export const AirtimePurchaseForm: React.FC<{
  inputs: {
    label: string;
    labelProps?: React.ComponentProps<"label">;
    inputProps: React.ComponentProps<"input">;
  }[];
  formProps?: FormProps;
  btnProps?: React.ComponentProps<"button">;
}> = ({ inputs, formProps = {}, btnProps }) => {
  const { Form, state } = useFetcher({ key: formProps.fetcherKey });

  return (
    <Form
      method="POST"
      className="max-w-lg 2xl:max-w-xl flex flex-col gap-4 md:gap-4 md:p-6 p-4 bg-white rounded-lg shadow-sm"
      {...formProps}
    >
      <Loading loading={state === "submitting"} variant={"page"} />
      <NetworkProviders />
      <NetworkSelect />
      <TypeSelect />
      {inputs.map((input, index) => (
        <FormInput key={index} {...input} />
      ))}
      <Button
        disabled={state === "submitting"}
        type="submit"
        className="w-32 ml-auto bg-sidebar-accent"
        {...btnProps}
      >
        Proceed to Pay
      </Button>
    </Form>
  );
};

// DataPurchaseForm (adds data plan select)
export type DataPlan = {
  id: string;
  name: string;
  price: number;
};
export const DataPurchaseForm: React.FC<{
  inputs: {
    label: string;
    labelProps?: React.ComponentProps<"label">;
    inputProps: React.ComponentProps<"input">;
  }[];
  formProps?: FormProps;
  btnProps?: React.ComponentProps<"button">;
  dataPlans: DataPlan[];
  getSelectedDataPlan?: (dataPlanId: string) => void;
}> = ({ inputs, formProps = {}, btnProps, dataPlans, getSelectedDataPlan }) => {
  const { Form, state } = useFetcher({ key: formProps.fetcherKey });

  return (
    <Form
      method="POST"
      className="max-w-lg 2xl:max-w-xl flex flex-col gap-4 md:gap-4 md:p-6 p-4 bg-white rounded-lg shadow-sm"
      {...formProps}
    >
      <Loading loading={state === "submitting"} variant={"page"} />
      <NetworkProviders />
      <NetworkSelect />
      <TypeSelect />
      <LabeledSelect label="Data Plan">
        <Select
          name="dataPlan"
          required
          onValueChange={(value) => {
            if (getSelectedDataPlan) {
              getSelectedDataPlan(value); // Call the callback with the selected data plan ID
            }
          }}
        >
          <SelectTrigger className="w-full border-gray-100 rounded-md shadow-sm focus:ring-1 focus:ring-gray-300">
            <SelectValue placeholder="Select Data Plan" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-gray-50">
            {dataPlans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.name} - ₦{plan.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </LabeledSelect>
      {inputs.map((input, index) => (
        <FormInput key={index} {...input} />
      ))}
      <Button
        disabled={state === "submitting"}
        type="submit"
        className="w-32 ml-auto bg-sidebar-accent"
        {...btnProps}
      >
        Proceed to Pay
      </Button>
    </Form>
  );
};
