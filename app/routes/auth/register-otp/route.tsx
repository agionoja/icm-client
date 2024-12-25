import { AuthContainer } from "~/routes/auth/components/auth-container";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { AuthForm } from "~/routes/auth/components/auth-form";
import { Button } from "~/components/ui/button";
import { useNavigation } from "react-router";
import { AuthHeading } from "~/routes/auth/components/auth-heading";

import type { Route } from "./+types/route";
import { throttleNetwork } from "~/utils/throttle-network";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  getRegistrationProgressFromCookie,
  isFormValid,
} from "~/cookies/registration-multi-step-form";
import { redirectWithError } from "remix-toast";
import { authRouteConfig } from "~/routes.config";

export async function action({ request }: Route.ActionArgs) {
  await throttleNetwork(5);
  const form = Object.fromEntries(await request.formData());
  console.log(form);
}

export async function loader({ request }: Route.LoaderArgs) {
  const formStep = await getRegistrationProgressFromCookie(request);

  if (!isFormValid(formStep)) {
    throw await redirectWithError(
      authRouteConfig.registerPassword.generate(),
      "Complete entering your details",
    );
  }

  return formStep;
}

export default function Route({ loaderData: { email } }: Route.ComponentProps) {
  const { state } = useNavigation();
  return (
    <>
      <AuthContainer previous={"/auth/register/password"}>
        <AuthHeading
          text={`Enter the code we sent to ${email} to finish signing up.`}
          heading={"You are almost signed up"}
        />
        <AuthForm method={"POST"}>
          <InputOTP name={"otp"} maxLength={6} pattern={REGEXP_ONLY_DIGITS}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button size={"authSize"} disabled={state === "submitting"}>
            {state === "submitting" ? "Submitting..." : "Submit"}
          </Button>
        </AuthForm>
      </AuthContainer>
    </>
  );
}
