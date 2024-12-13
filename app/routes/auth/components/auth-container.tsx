import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, ArrowRight } from "~/components/icons";

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
    <div className="min:h-[40rem] flex w-full flex-col justify-between gap-8 rounded-4xl bg-white px-4 py-10 shadow-lg md:px-10 lg:min-h-[54rem] lg:w-[40rem]">
      <Header next={next} previous={previous} nextBtnProps={nextBtnProps} />
      <main
        className={`auth-container-px flex flex-col gap-8 ${className}`}
        {...rest}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className={"flex flex-col gap-3 pt-3"}>
      <nav className="auth-container-px mx-auto">
        <ul className="flex list-inside list-disc gap-4 text-[10px] md:text-lg">
          <li className="">
            <Link prefetch={"intent"} className="font-bold" to={"/"}>
              Home
            </Link>
          </li>
          <li>
            <Link prefetch={"intent"} className="font-bold" to={"/services"}>
              Services
            </Link>
          </li>
          <li>
            <Link prefetch={"intent"} className="font-bold" to={"/contact"}>
              Contact
            </Link>
          </li>
        </ul>
      </nav>
      <div className="h-0.5 bg-gray-200" />
      <p className="auth-container-px pt-3 text-center text-[7.5px] lg:text-sm">
        By continuing, you agree to ICM Tech&#39;s{" "}
        <Link to={"/terms"} className={"inline text-primary underline"}>
          Terms of Use.
        </Link>{" "}
        Read{" "}
        <Link
          to={"/privacy"}
          className={"inline text-primary underline lg:text-sm"}
        >
          Privacy Policy
        </Link>
      </p>
    </footer>
  );
}

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
          className={`${!next || !previous ? "basis-full" : ""} text-center text-xs font-bold lg:text-xl`}
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
