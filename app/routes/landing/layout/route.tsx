import { Header } from "~/routes/landing/components/header";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className={"px-5 md:px-28"}>
      <Header />
      <Outlet />
    </div>
  );
}
