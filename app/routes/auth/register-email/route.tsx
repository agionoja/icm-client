// eslint-disable-next-line import/no-unresolved
import { Route } from "./+types/route";
import { AuthContainer } from "~/routes/auth/components/auth-container";
import {
  data,
  redirect,
  SubmitFunction,
  useFetcher,
  useNavigation,
} from "react-router";
import { BlueButton } from "~/components/button";
import { useEffect, useReducer, useRef } from "react";
import {
  getRegistrationProgressFromCookie,
  setRegistrationProgressCookie,
} from "~/cookies/registration-multi-step-form";
import { AuthHeading } from "~/routes/auth/components/auth-heading";
import { Input } from "~/routes/auth/register-email/input";
import { PhoneInput } from "~/components/phone-input";
import { checkUser } from "~/routes/auth/register-email/check-user";
import { AuthForm } from "~/routes/auth/components/auth-form";
import { toast } from "react-toastify";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import { throttleNetwork } from "~/utils/throttle-network";

export async function action({ request }: Route.ActionArgs) {
  const { _action, ...values } = Object.fromEntries(await request.formData());
  const setFormCookie = await setRegistrationProgressCookie(values, request);
  const headers = { "Set-Cookie": setFormCookie };

  if (_action === "register") {
    await throttleNetwork(0);
    const { exists, error } = await checkUser(
      values.email,
      parsePhoneNumberWithError(values.phone as string).format("E.164"),
    );

    if (exists || error) {
      return data({ error }, { headers, status: error?.statusCode });
    }

    return redirect("/auth/register/password", { headers });
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
    firstname: loaderData.formStep.firstname || "",
    lastname: loaderData.formStep.lastname || "",
    email: loaderData.formStep.email || "",
  };
  const { submit } = useFetcher();
  const navigation = useNavigation();
  const [state, dispatch] = useReducer(reducer(submit), initialState);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);

  const isActionError = actionData && "error" in actionData && actionData.error;
  const isPhoneError = !!(isActionError && actionData.error?.label === "phone");
  const isEmailError = !!(isActionError && actionData.error?.label === "email");

  const isBothError = !!(isActionError && actionData.error?.label === "both");
  const errorMsg = isActionError ? actionData.error?.message : "";
  const phoneMsg = isPhoneError || isBothError ? errorMsg : "";

  const emailMsg = isEmailError || isBothError ? errorMsg : "";

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

  return (
    <>
      <AuthContainer
        previous={"/auth/register/options"}
        next={"/auth/register/password"}
        childrenContainerProps={{ className: "flex flex-col gap-8" }}
        nextBtnProps={{ disabled: true }}
      >
        <AuthHeading
          heading={"Continue with email"}
          text={
            "We'll check if you have an account, and help create one if you don't"
          }
        />
        <AuthForm method={"POST"} className={""}>
          <Input
            required
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
          <BlueButton
            disabled={navigation.state === "submitting"}
            name={"_action"}
            value={"register"}
            type={"submit"}
          >
            {navigation.state === "submitting" ? "Checking..." : "Continue"}
          </BlueButton>
        </AuthForm>
      </AuthContainer>
    </>
  );
}

function reducer(submit: SubmitFunction) {
  return function reducer(
    state: { firstname: string; lastname: string; email: string },
    action: { payload: string; type: string },
  ) {
    const formData = new FormData();
    const submitFunction = (payload: FormData) =>
      submit(payload, {
        method: "POST",
        action: "/auth/register/email",
      });
    switch (action.type) {
      case "SET_FIRSTNAME": {
        formData.append("firstname", action.payload);
        submitFunction(formData);
        return { ...state, firstname: action.payload };
      }
      case "SET_LASTNAME": {
        formData.append("lastname", action.payload);
        submitFunction(formData);
        return { ...state, lastname: action.payload };
      }
      case "SET_EMAIL": {
        formData.append("email", action.payload);
        submitFunction(formData);
        return { ...state, email: action.payload };
      }
      default:
        throw new Error("Invalid action type");
    }
  };
}
