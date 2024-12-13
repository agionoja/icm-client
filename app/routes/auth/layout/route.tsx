import { Link, Outlet } from "react-router";
import logo from "~/assets/logos/SVG/Primary Logo - Full Color.svg";

export default function AuthLayout() {
  return (
    <div
      className={
        "flex h-screen min-h-[900px] items-center justify-center bg-white bg-auth-pattern-mobile bg-contain bg-top bg-no-repeat text-black lg:bg-auth-pattern-desktop lg:px-28 lg:py-20"
      }
    >
      <div
        className={
          "flex w-full flex-col-reverse gap-20 lg:flex-row lg:justify-between"
        }
      >
        <Link className={"lg:mt-auto"} to={"/"}>
          <img src={logo} height={50} width={182} alt="ICM Tech logo" />
        </Link>
        <Outlet />
      </div>
    </div>
  );
}
