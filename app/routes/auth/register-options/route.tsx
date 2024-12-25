import { Link } from "react-router";
import { AuthContainer } from "~/routes/auth/components/auth-container";
import { Email, Facebook, Google } from "~/components/icons";
import { Button, buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { AuthHeading } from "~/routes/auth/components/auth-heading";

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
          text={"Sign up in seconds"}
          heading={
            "Use your email or another service to continue with ICM Tech"
          }
        />
        <Options />
      </AuthContainer>
    </>
  );
}

function Options() {
  return (
    <div className={"flex w-full flex-col items-center justify-center gap-4"}>
      <Button variant={"ghost"} size={"authSize"}>
        <Google size={20} />
        <span className={""}>Continue with Google</span>
      </Button>
      <Button size={"authSize"} variant={"ghost"}>
        <Facebook fill={"blue"} size={20} />
        <span>Continue with Facebook</span>
      </Button>
      <Link
        to={"/auth/register/email"}
        className={cn(buttonVariants({ variant: "ghost", size: "authSize" }))}
      >
        <Email size={20} />
        <span>Continue with Email</span>
      </Link>
    </div>
  );
}
