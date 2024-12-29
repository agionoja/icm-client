import type { Route } from "./+types/route";
import { data, useNavigation, useSearchParams } from "react-router";
import { AuthContainer } from "~/routes/auth/components/auth-container";
import { Facebook, Google } from "~/components/icons";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { AuthForm } from "~/routes/auth/components/auth-form";
import { timeoutSession } from "~/toast/timeout-toast";
import { getFlashSession } from "~/utils/flash-message";
import { login } from "~/routes/auth/login/queries";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const meta: Route.MetaFunction = () => {
  return [{ title: "ICM Tech - Login" }];
};

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  switch (_action) {
    case "login": {
      return login(request, values.redirect, {
        email: values.email as string,
        password: values.password as string,
      });
    }
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const { flash, headers } = await getFlashSession(request, {
    sessionStorage: timeoutSession,
  });
  return data({ flash }, { headers });
}

export default function Login({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const flash =
    loaderData && "flash" in loaderData ? loaderData.flash : undefined;
  const redirect = searchParams.get("redirect") ?? "";
  const { state, formData } = useNavigation();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const isError = !!(actionData && "error" in actionData);
  const isAuthError =
    actionData && "error" in actionData && actionData.error.statusCode === 401;
  const authErrorMsg = isAuthError ? actionData.error.message : "";
  const isLoggingIn =
    state === "submitting" && formData?.get("_action") === "login";

  useEffect(() => {
    if (isError) {
      setErrorMessage(actionData.error?.message);
    }
  }, [actionData, isError]);

  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.select();
    }
  }, []);

  useEffect(() => {
    if (!isLoggingIn && emailRef.current && errorMessage) {
      if (isAuthError) emailRef.current.select();
      toast(errorMessage, { type: "error" });

      // Clear the error message after showing the toast
      setErrorMessage(undefined);
    }
  }, [isLoggingIn, errorMessage, isAuthError]);

  return (
    <>
      <AuthContainer>
        <AuthForm method={"POST"} className={""}>
          <input type="text" hidden defaultValue={redirect} name="redirect" />
          {flash && (
            <span
              className={
                "mb-4 w-full rounded-lg bg-gray-100 px-4 py-3 text-center font-medium"
              }
            >
              {flash}
            </span>
          )}
          <Label className={"w-full"}>
            <span className={"sr-only"}>Email</span>
            <Input
              ref={emailRef}
              autoComplete={"email"}
              required
              aria-invalid={isAuthError}
              aria-labelledby={authErrorMsg}
              placeholder={"Email"}
              type={"email"}
              name={"email"}
            />
          </Label>
          <Label className={"w-full"}>
            <span className={"sr-only"}>Password</span>
            <Input
              required
              aria-invalid={isAuthError}
              aria-labelledby={authErrorMsg}
              autoComplete={"current-password"}
              minLength={8}
              placeholder={"Password"}
              type={"password"}
              name={"password"}
            />
          </Label>
          <Button
            disabled={isLoggingIn}
            name={"_action"}
            value={"login"}
            type={"submit"}
            className={`${isLoggingIn ? "cursor-not-allowed" : ""} w-full`}
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </Button>
          <Button
            variant={"ghost"}
            name={"_action"}
            value={"google"}
            className={"w-full"}
          >
            <Google size={20} />
            <span className={"font-medium"}>Continue with Google</span>
          </Button>
          <Button
            variant={"ghost"}
            name={"_action"}
            value={"facebook"}
            className={"w-full"}
          >
            <Facebook fill={"blue"} size={20} />
            <span className={"font-medium"}>Continue with Facebook</span>
          </Button>
        </AuthForm>
      </AuthContainer>
    </>
  );
}
