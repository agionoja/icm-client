import type { Route } from "./+types/route";
import { getClientIPAddress } from "remix-utils/get-client-ip-address";
import { data, redirect, useNavigation, useSearchParams } from "react-router";
import { fetchClient } from "~/fetch/fetch-client";
import {
  createSession,
  getRole,
  getToken,
  hasSession,
} from "~/sessions/auth-session";
import { AuthContainer } from "~/routes/auth/components/auth-container";
import { BlueButton, SilverBorderButton } from "~/components/button";
import { Facebook, Google } from "~/components/icons";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import type { User } from "@agionoja/icm-shared";
import { safeRedirect } from "~/utils/safe-redirect";
import { Input } from "~/routes/auth/register-email/input";
import { AuthForm } from "~/routes/auth/components/auth-form";
import {
  destroyTimeoutMessageSession,
  getTimeoutMessageSession,
} from "~/sessions/auth-timeout-session";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);

  switch (_action) {
    case "login": {
      const { data: userToken, exception } = await fetchClient<
        string,
        "accessToken"
      >("/auth/login", {
        responseKey: "accessToken",
        method: "POST",
        body: JSON.stringify(values),
      });

      console.log(`Client IP: ${getClientIPAddress(request)}`);

      const {
        data: profile,
        exception: profileException,
        message: profileMessage,
      } = await fetchClient<User, "user">("/auth/profile", {
        responseKey: "user",
        token: userToken?.accessToken,
        headers: {
          "X-Forwarded-For": request.headers.get("X-Forwarded-For") || "",
        },
      });

      if (exception || profileException) {
        return data(
          {
            error: {
              message: exception?.message || profileException?.message,
              statusCode: exception?.statusCode || exception?.statusCode,
            },
          },
          { status: exception?.statusCode || profileException?.statusCode },
        );
      }

      const redirectTo = safeRedirect(
        formData.get("redirect"),
        profile?.user.role === "ADMIN" ? "/admin/dashboard" : "/user/dashboard",
      );

      return createSession({
        role: profile.user.role,
        request,
        remember: true,
        message: profileMessage || `Welcome back ${profile?.user.firstname}!`,
        redirectTo,
        token: userToken?.accessToken,
        init: {
          headers: {
            "Set-Cookie": await destroyTimeoutMessageSession(request),
          },
        },
      });
    }
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const timeoutSessionMessage = (await getTimeoutMessageSession(request)).get(
    "message",
  );

  if (timeoutSessionMessage) return { timeoutSessionMessage };

  if (!(await hasSession(request))) return;
  const token = await getToken(request);
  const role = (await getRole(request)) as User["role"];

  // console.log({ token, role });
  const url = new URL(request.url);
  const refererUrl = new URL(request.headers.get("referer") || request.url);
  const searchParams = new URLSearchParams(url.search);

  const redirectPath = searchParams.get("redirect");
  // Check for referer redirect (avoiding infinite redirect)
  if (refererUrl.pathname !== url.pathname) {
    return redirect(refererUrl.pathname);
  }

  // Check for redirect query parameter
  if (redirectPath) {
    return redirect(redirectPath);
  }

  // Redirect based on token and role
  if (token && role) {
    // console.log(token);
    return redirect(role === "USER" ? "/user/dashboard" : "/admin/dashboard");
  }

  // Default redirect to home
  return redirect("/");
}

export default function Login({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const timeoutMessage =
    loaderData && "timeoutSessionMessage" in loaderData
      ? loaderData.timeoutSessionMessage
      : undefined;
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
          {timeoutMessage && (
            <span
              className={
                "mb-4 w-full rounded-md bg-gray-100 px-4 py-3 text-center font-medium"
              }
            >
              {timeoutMessage}
            </span>
          )}
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
          <label className={"flex w-full justify-center"}>
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
          </label>
          <BlueButton
            disabled={isLoggingIn}
            name={"_action"}
            value={"login"}
            type={"submit"}
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </BlueButton>
          <SilverBorderButton
            name={"_action"}
            value={"google"}
            className={"flex shrink-0 grow items-center justify-center gap-4"}
          >
            <Google size={20} />
            <span className={"text-[7.5px] font-bold md:text-sm"}>
              Continue with Google
            </span>
          </SilverBorderButton>
          <SilverBorderButton
            name={"_action"}
            value={"facebook"}
            className={"flex shrink-0 grow items-center justify-center gap-4"}
          >
            <Facebook fill={"blue"} size={20} />
            <span className={"text-[7.5px] font-bold md:text-sm"}>
              Continue with Facebook
            </span>
          </SilverBorderButton>
        </AuthForm>
      </AuthContainer>
    </>
  );
}
