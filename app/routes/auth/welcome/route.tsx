import { AuthContainer } from "../components/auth-container";
import { Link } from "react-router";
import { AuthHeading } from "~/routes/auth/components/auth-heading";
import { authRouteConfig } from "~/routes.config";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/button";

function Main() {
  return (
    <div className="flex w-full flex-grow flex-col items-center justify-center bg-white">
      <Link
        className={cn(buttonVariants({ size: "authSize" }))}
        to={"/auth/register/options"}
      >
        Sign Up{" "}
      </Link>

      <div className="flex w-full items-center gap-2 px-20 py-2 md:px-32 md:py-4">
        <div className="h-0.5 flex-grow bg-gray-300"></div>
        <span className="text-gray-500">Or</span>
        <div className="h-0.5 flex-grow bg-gray-300"></div>
      </div>

      <div>
        <p className={"text-[9px] md:text-sm"}>
          Already have an account?{" "}
          <Link to={"/auth/login"} className={"inline text-primary"}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function Welcome() {
  return (
    <>
      <AuthContainer next={authRouteConfig.registerWelcome.getPath}>
        <div className="flex h-full w-full flex-col items-center gap-4 md:gap-8">
          <AuthHeading
            heading={"Welcome to ICM Tech"}
            text={" Swift ad Cool life made Easy!"}
          />

          <Main />
        </div>
      </AuthContainer>
    </>
  );
}
