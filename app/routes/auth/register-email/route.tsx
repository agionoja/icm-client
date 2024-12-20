import type { Route } from "./+types/route";
import { AuthContainer } from "~/routes/auth/components/auth-container";
import { data, redirect, useFetcher, useNavigation } from "react-router";
import { useEffect, useReducer, useRef } from "react";
import {
  getRegistrationProgressFromCookie,
  setRegistrationProgressCookie,
} from "~/cookies/registration-multi-step-form";
import { PhoneInput } from "~/components/phone-input";
import { checkUser } from "~/routes/auth/register-email/check-user";
import { AuthForm } from "~/routes/auth/components/auth-form";
import { toast } from "react-toastify";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import { throttleNetwork } from "~/utils/throttle-network";
import { Input } from "~/components/input";
import { Button } from "~/components/button";
import { authRouteConfig } from "~/routes.config";
import { AuthHeading } from "~/routes/auth/components/auth-heading";

export async function action({ request }: Route.ActionArgs) {
  const { _action, ...values } = Object.fromEntries(await request.formData());
  const setFormCookie = await setRegistrationProgressCookie(values, request);
  const headers = { "Set-Cookie": setFormCookie };

  if (_action === "register") {
    await throttleNetwork(0);
    const { exists, error } = await checkUser(
      String(values.email),
      parsePhoneNumberWithError(values.phone as string).format("E.164"),
    );

    if (exists || error) {
      return data({ error }, { headers, status: error?.statusCode });
    }

    return redirect(authRouteConfig.registerPassword.getPath, { headers });
  }

  return data({ error: null }, { headers });
}

export async function loader({ request }: Route.LoaderArgs) {
  const formStep = await getRegistrationProgressFromCookie(request);
  return { formStep };
}

export default function EmailRegister({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const initialState = {
    firstname: loaderData?.formStep?.firstname || "",
    lastname: loaderData?.formStep?.lastname || "",
    email: loaderData?.formStep?.email || "",
  };

  const { submit } = useFetcher();
  const navigation = useNavigation();
  const [state, dispatch] = useReducer(reducer, initialState);

  const emailRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);

  const isActionError = actionData && "error" in actionData && actionData.error;
  const isPhoneError = !!(isActionError && actionData.error?.label === "phone");
  const isEmailError = !!(isActionError && actionData.error?.label === "email");
  const isBothError = !!(isActionError && actionData.error?.label === "both");
  const errorMsg = isActionError ? actionData.error?.message : "";
  const phoneMsg = isPhoneError || isBothError ? errorMsg : "";
  const emailMsg = isEmailError || isBothError ? errorMsg : "";

  // UseEffect to submit form data when the state changes
  useEffect(() => {
    if (state.firstname || state.lastname || state.email) {
      const formData = new FormData();
      formData.append("firstname", state.firstname);
      formData.append("lastname", state.lastname);
      formData.append("email", state.email);

      submit(formData, {
        method: "POST",
        action: authRouteConfig.registerEmail.getPath,
      });
    }
  }, [state, submit]); // Trigger submission whenever the form state changes

  useEffect(() => {
    if (isActionError) {
      toast(errorMsg, { type: "error" });
      if (isBothError && emailRef.current) {
        emailRef.current.select();
      }

      if (isEmailError && emailRef.current) {
        emailRef.current.select();
      }

      if (isPhoneError && phoneRef.current) {
        phoneRef.current.select();
      }
    }
  }, [errorMsg, isActionError, isBothError, isEmailError, isPhoneError]);

  useEffect(() => {
    if (phoneRef.current && phoneRef.current.checkValidity()) {
      console.log("PHone is invalid");
      phoneRef.current.select();
    }
  }, []);

  return (
    <>
      <AuthContainer
        previous={"/auth/register/options"}
        next={"/auth/register/password"}
        childrenContainerProps={{ className: "flex flex-col gap-8" }}
        nextBtnProps={{ disabled: true }}
      >
        <AuthHeading
          text={
            "We’ll check if you have an account, and help create one if you don’t."
          }
          heading={"Continue with email"}
        />
        <AuthForm className={""}>
          <Input
            required
            className={"w-full lg:w-9/12"}
            placeholder={"First name"}
            type={"text"}
            minLength={2}
            value={state.firstname}
            onChange={(e) =>
              dispatch({ type: "SET_FIRSTNAME", payload: e.target.value })
            }
            name={"firstname"}
          />
          <Input
            required
            className={"w-full lg:w-9/12"}
            placeholder={"Last name"}
            type={"text"}
            minLength={2}
            value={state.lastname}
            onChange={(e) =>
              dispatch({ type: "SET_LASTNAME", payload: e.target.value })
            }
            name={"lastname"}
          />
          <Input
            required
            className={"w-full lg:w-9/12"}
            placeholder={"Email"}
            ref={emailRef}
            type={"email"}
            aria-invalid={isBothError || isEmailError}
            aria-labelledby={emailMsg}
            value={state.email}
            onChange={(e) =>
              dispatch({ type: "SET_EMAIL", payload: e.target.value })
            }
            name={"email"}
          />
          <PhoneInput
            className={"w-full lg:w-9/12"}
            phoneDefault={loaderData.formStep?.phone}
            name={"phone"}
            inputRef={phoneRef}
            inputProps={{
              "aria-labelledby": phoneMsg,
              "aria-invalid": isBothError || isEmailError,
            }}
            placeholder={"Phone number"}
            fetcherUrl={"/auth/register/email"}
          />
          <Button
            size={"authSize"}
            disabled={navigation.state === "submitting"}
            name={"_action"}
            value={"register"}
            type={"submit"}
          >
            {navigation.state === "submitting" ? "Checking..." : "Continue"}
          </Button>
        </AuthForm>
      </AuthContainer>
    </>
  );
}

function reducer(
  state: { firstname: string; lastname: string; email: string },
  action: {
    payload: string;
    type: "SET_FIRSTNAME" | "SET_LASTNAME" | "SET_EMAIL";
  },
) {
  switch (action.type) {
    case "SET_FIRSTNAME":
      return { ...state, firstname: action.payload };
    case "SET_LASTNAME":
      return { ...state, lastname: action.payload };
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    default:
      throw new Error("Invalid action type");
  }
}
