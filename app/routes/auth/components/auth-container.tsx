import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, ArrowRight } from "~/components/icons";
import { landingRouteConfig } from "~/routes.config";

type Props = {
  previous?: string;
  next?: string;
  children: ReactNode;
  childrenContainerProps?: HTMLAttributes<HTMLDivElement>;
  nextBtnProps?: ButtonHTMLAttributes<HTMLButtonElement>;
};

export function AuthContainer({
  previous,
  next,
  children,
  nextBtnProps,
  childrenContainerProps: { className, ...rest } = {},
}: Props) {
  return (
    <div className="flex min-h-[40rem] w-full shrink-0 grow flex-col justify-between gap-8 rounded-4xl bg-white py-10 shadow-lg lg:min-h-[50rem] lg:max-w-[45%] 2xl:max-w-[35%]">
      <Header next={next} previous={previous} nextBtnProps={nextBtnProps} />
      <main
        className={`flex flex-col gap-8 px-4 lg:gap-12 lg:px-10 ${className}`}
        {...rest}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}

const Footer = () => (
  <footer className="flex flex-col gap-3 pt-3">
    <nav className="auth-container-px mx-auto">
      <ul className="flex list-inside list-disc gap-4 text-sm md:text-md">
        {[
          { to: landingRouteConfig.home.getPath, label: "Home" },
          { to: landingRouteConfig.services.getPath, label: "Services" },
          { to: landingRouteConfig.contact.getPath, label: "Contact" },
        ].map(({ to, label }) => (
          <li key={to}>
            <Link prefetch="intent" className="font-bold" to={to}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
    <div className="h-0.5 bg-gray-200" />
    <p className="auth-container-px pt-3 text-center text-xs md:text-md">
      By continuing, you agree to ICM Tech&#39;s{" "}
      <Link to="/terms" className="inline text-primary underline">
        Terms of Use.
      </Link>{" "}
      Read{" "}
      <Link to="/privacy" className="inline text-primary underline">
        Privacy Policy
      </Link>
    </p>
  </footer>
);

function Header({
  next,
  previous,
  nextBtnProps,
}: Pick<Props, "next" | "previous" | "nextBtnProps">) {
  const navigate = useNavigate();
  return (
    <header className={`flex flex-col gap-3`}>
      <div className={`auth-container-px flex items-center justify-between`}>
        {previous && (
          <button onClick={() => navigate(previous)}>
            <ArrowLeft />
          </button>
        )}
        <h1
          className={`${!next || !previous ? "basis-full" : ""} text-center text-sm font-bold md:text-lg`}
        >
          Continue to ICM Tech
        </h1>
        {next && (
          <button onClick={() => navigate(next)} {...nextBtnProps}>
            <ArrowRight />
          </button>
        )}
      </div>
      {/* Add a full-width border below the header content */}
      <div className="h-0.5 bg-gray-200" />
    </header>
  );
}
