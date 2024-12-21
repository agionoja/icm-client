import {
  PhoneInput as Phone,
  type PhoneInputProps,
  type PhoneInputRefType,
} from "react-international-phone";
import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";
import validator from "validator";

export function PhoneInput({
  className,
  phoneDefault = "",
  fetcherUrl,
  fetcherName = "phone",
  ...rest
}: PhoneInputProps & {
  phoneDefault?: string;
  fetcherUrl: string;
  fetcherName?: string;
}) {
  const [phone, setPhone] = useState(phoneDefault);
  const fetcher = useFetcher();
  const phoneInputRef = useRef<PhoneInputRefType>(null);

  const validatePhone = (phone: string) => {
    if (phoneInputRef.current) {
      if (!validator.isMobilePhone(phone, ["en-NG"])) {
        phoneInputRef.current.setCustomValidity("Invalid phone number");
      } else {
        phoneInputRef.current.setCustomValidity("");
      }
    }
  };

  const submitPhoneToFetcher = (phone: string) => {
    if (fetcherUrl) {
      try {
        const formData = new FormData();
        formData.append(fetcherName, phone);
        return fetcher.submit(formData, {
          method: "POST",
          action: fetcherUrl,
        });
      } catch (error) {
        console.error("Error parsing phone number:", error);
      }
    }
  };

  useEffect(() => {
    validatePhone(phone);
  }, [phone]); // Runs whenever `phone` changes

  const handlePhoneChange = (phone: string) => {
    setPhone(phone);
    if (phone) {
      return submitPhoneToFetcher(phone);
    }
  };

  return (
    <Phone
      ref={phoneInputRef}
      defaultCountry="ng"
      value={phone}
      required
      onChange={handlePhoneChange}
      className={`auth-input ${className}`}
      inputClassName={"w-full"}
      {...rest}
    />
  );
}
