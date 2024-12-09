import { Link } from "react-router";
import { AuthContainer } from "~/routes/auth/components/auth-container";
import { AuthHeading } from "~/routes/auth/components/auth-heading";
import { SilverBorderButton } from "~/components/button";
import { Email, Facebook, Google } from "~/components/icons";

export default function Route() {
  return (
    <>
      <AuthContainer
        previous={"/auth/register/welcome"}
        next={"/auth/register/email"}
        childrenContainerProps={{
          className: "flex items-center justify-center flex-col gap-8",
        }}
      >
        <AuthHeading
          heading={"Sign up in seconds"}
          text={"Use your email or another service to continue with ICM Tech"}
        />
        <Options />
      </AuthContainer>
    </>
  );
}

function Options() {
  return (
    <div className={"flex w-full flex-col items-center justify-center gap-4"}>
      <SilverBorderButton
        className={"flex shrink-0 grow items-center justify-center gap-4"}
      >
        <Google size={20} />
        <span className={"text-[7.5px] font-bold md:text-sm"}>
          Continue with Google
        </span>
      </SilverBorderButton>
      <SilverBorderButton
        className={"flex shrink-0 grow items-center justify-center gap-4"}
      >
        <Facebook fill={"blue"} size={20} />
        <span className={"text-[7.5px] font-bold md:text-sm"}>
          Continue with Facebook
        </span>
      </SilverBorderButton>
      <Link
        to={"/auth/register/email"}
        className={"flex w-full items-center justify-center"}
      >
        <SilverBorderButton
          className={"flex shrink-0 grow items-center justify-center gap-4"}
        >
          <Email size={20} />
          <span className={"text-[7.5px] font-bold md:text-sm"}>
            Continue with Email
          </span>
        </SilverBorderButton>
      </Link>
    </div>
  );
}
