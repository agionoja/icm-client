import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { GloIcon, MTNIcon } from "~/components/icons";
import EtisalatIcon from "~/assets/icons/9mobile-logo.png";
import AirtelIcon from "~/assets/icons/airtel-logo-white-text-vertical.jpg";
import { useFetcher } from "react-router";
import { Label } from "~/components/ui/label";
import { Loading } from "~/components/loading";

function Network() {
  return (
    <Label className="flex flex-col gap-3 2xl:gap-4 text-sm font-medium text-gray-700 mb-1">
      <span>Network</span>
      <Select required>
        <SelectTrigger className="w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500">
          <SelectValue placeholder="Select Network" />
        </SelectTrigger>
        <SelectContent className={"z-50 bg-gray-50"}>
          <SelectItem value="mtn">
            <input type="text" hidden name={"mtn"} defaultValue={"mtn"} />
            <div className="flex items-center">
              <MTNIcon className="w-5 h-5 mr-2" />
              MTN
            </div>
          </SelectItem>
          <SelectItem value="airtel">
            <input hidden type="text" name={"airtel"} defaultValue={"airtel"} />
            <div className="flex items-center">
              <div className="flex items-center">
                <img src={AirtelIcon} alt="9mobile" className="w-5 h-5 mr-2" />
                Airtel
              </div>
            </div>
          </SelectItem>
          <SelectItem value="glo">
            <input type="text" defaultValue={"glo"} name={"glo"} hidden />
            <div className="flex items-center">
              <GloIcon className="w-5 h-5 mr-2" />
              Glo
            </div>
          </SelectItem>
          <SelectItem value="etisalat">
            <input
              type="text"
              hidden
              name={"etisalat"}
              defaultValue={"etisalat"}
            />
            <div className="flex items-center">
              <img src={EtisalatIcon} alt="9mobile" className="w-5 h-5 mr-2" />
              9mobile
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </Label>
  );
}

function Type() {
  return (
    <Label className="flex flex-col gap-3 2xl:gap-4 text-sm font-medium text-gray-700 mb-1">
      <span>Type</span>
      <Select required>
        <SelectTrigger className="w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500">
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
export function DataAirtimeForm() {
  const { Form, state } = useFetcher();
  return (
    <Form
      method={"POST"}
      className="max-w-lg 2xl::max-w-xl flex flex-col gap-3 2xl:gap-4 mx-auto p-6 bg-white rounded-lg shadow-md"
    >
      <Loading variant={"page"} loading={state === "submitting"} />
      {/* Network Select */}
      <Network />
      {/* Type Select */}
      <Type />

      {/* Phone Number Input */}
      <Label
        className={"flex flex-col gap-4 text-sm font-medium text-gray-700 mb-1"}
      >
        <span>Phone Number</span>
        <Input
          name="phoneNumber"
          type="tel"
          placeholder="Enter Recipient's Phone Number"
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500"
        />
      </Label>

      {/* Amount Input */}
      <Label
        className={
          "flex flex-col gap-3 2xl:gap-4 text-sm font-medium text-gray-700 mb-1"
        }
      >
        <span>Amount</span>
        <Input
          name="amount"
          type="number"
          step={100}
          min={100}
          max={100_000}
          required
          placeholder="Enter Amount to pay"
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500"
        />
      </Label>

      {/* Submit Button */}
      <Button
        type={"submit"}
        className="bg-primary w-32 ml-auto text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Proceed to Pay
      </Button>
    </Form>
  );
}
