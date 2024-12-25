import { AuthContainer } from "~/routes/auth/components/auth-container";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { AuthForm } from "~/routes/auth/components/auth-form";
import type { Route } from "./+types/route";
import { data, redirect, useNavigation, useSubmit } from "react-router";
import {
  getRegistrationProgressFromCookie,
  isFormValid,
  type Register,
  setRegistrationProgressCookie,
} from "~/cookies/registration-multi-step-form";
import { register } from "~/routes/auth/register-password/queries";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import { authRouteConfig } from "~/routes.config";
import { redirectWithError, redirectWithSuccess } from "remix-toast";
import { useEffect, useReducer, useRef } from "react";
import { toast } from "react-toastify";

export async function action({ request }: Route.LoaderArgs) {
  const { _action, ...values } = Object.fromEntries(await request.formData());
  const setFormCookie = await setRegistrationProgressCookie(values, request);
  switch (_action) {
    case "register": {
      const registerEmailUrl = authRouteConfig.registerEmail.getPath;
      try {
        const formStep = await getRegistrationProgressFromCookie(request);
        if (!isFormValid(formStep)) {
          return await redirectWithError(
            registerEmailUrl,
            "Enter your details",
          );
        }

        const registerDto = {
          ...values,
          ...formStep,
          phone: parsePhoneNumberWithError(String(formStep.phone)).format(
            "E.164",
          ),
        } as unknown as Register;

        const { message, exception } = await register(registerDto);

        if (exception) {
          // console.error(exception);
          return data({ error: { message: exception.message } });
        }

        return await redirectWithSuccess(
          authRouteConfig.registerOtp.getPath,
          message || "Account created successfully.",
        );
      } catch (e) {
        console.log(e);
        throw await redirectWithError(
          registerEmailUrl,
          "Phone number is invalid",
        );
      }
    }
  }

  return data(null, {
    headers: {
      "Set-Cookie": setFormCookie,
    },
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  const formStep = await getRegistrationProgressFromCookie(request);
  if (!isFormValid(formStep)) {
    throw redirect(authRouteConfig.registerEmail.generate());
  }

  return { formStep };
}

export default function Route({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { state } = useNavigation();
  const submit = useSubmit();
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const error =
    actionData && "error" in actionData ? actionData.error : undefined;
  const isSubmitting = state === "submitting";

  const [formState, dispatch] = useReducer(reducer, {
    password: loaderData?.formStep?.password || "",
    passwordConfirm: loaderData?.formStep?.passwordConfirm || "",
  });

  useEffect(() => {
    if (formState.password || formState.passwordConfirm) {
      submit(
        {
          password: formState.password,
          passwordConfirm: formState.passwordConfirm,
        },
        { method: "POST" },
      );
    }
  }, [formState.password, formState.passwordConfirm, submit]);

  // Display error messages
  useEffect(() => {
    if (error) {
      toast(error.message, { type: "error" });
    }
  }, [error]);

  useEffect(() => {
    if (error) {
      passwordRef?.current?.select();
    }
  }, [error]);

  return (
    <>
      <AuthContainer
        previous={"/auth/register/email"}
        next={"/auth/register/otp"}
      >
        <AuthForm>
          <Label className={"w-full"}>
            <span className={"sr-only"}>Password</span>
            <Input
              type={"password"}
              name={"password"}
              ref={passwordRef}
              autoComplete={"current-password"}
              aria-labelledby={error ? error.message : undefined}
              aria-invalid={!error}
              placeholder={"Password"}
              required
              value={formState.password}
              onChange={(e) =>
                dispatch({ type: "SET_PASSWORD", payload: e.target.value })
              }
              minLength={8}
            />
          </Label>
          <Label className={"w-full"}>
            <span className={"sr-only"}>Confirm Password</span>
            <Input
              type={"password"}
              name={"passwordConfirm"}
              placeholder={"Confirm Password"}
              autoComplete={"current-password"}
              aria-labelledby={error ? error.message : undefined}
              aria-invalid={!error}
              required
              value={formState.passwordConfirm}
              onChange={(e) =>
                dispatch({
                  type: "SET_PASSWORD_CONFIRM",
                  payload: e.target.value,
                })
              }
              minLength={8}
            />
          </Label>
          <Button
            name={"_action"}
            value={"register"}
            disabled={isSubmitting}
            className={"w-full"}
            type={"submit"}
          >
            {isSubmitting ? "Creating..." : "Continue"}
          </Button>
        </AuthForm>
      </AuthContainer>
    </>
  );
}

function reducer(
  state: { password: string; passwordConfirm: string },
  action: { payload: string; type: "SET_PASSWORD" | "SET_PASSWORD_CONFIRM" },
) {
  switch (action.type) {
    case "SET_PASSWORD":
      return { ...state, password: action.payload };
    case "SET_PASSWORD_CONFIRM":
      return { ...state, passwordConfirm: action.payload };
    default:
      throw new Error("Invalid action type");
  }
}
