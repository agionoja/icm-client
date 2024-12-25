import logo from "~/assets/logos/svg/primary-logo-full-color.svg";
import { Link, NavLink } from "react-router";
import { useState } from "react";
import { Close, Hamburger } from "~/components/icons";
import { Button } from "~/components/ui/button";

type Props = {
  isLoggedIn: boolean;
};

export function Header({ isLoggedIn }: Props) {
  return (
    <>
      <header
        className={
          "flex w-full items-start justify-between py-6 md:items-center"
        }
      >
        <img width={146} height={40} src={logo} alt="ICM Teach logo" />
        <Nav />
        {!isLoggedIn && (
          <Link className={"hidden md:block"} to="/auth/register/welcome">
            <Button>Get Started</Button>
          </Link>
        )}
      </header>
    </>
  );
}

function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  const handleIsOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={`relative`}>
      <button className={"block md:hidden"} onClick={handleIsOpen}>
        {isOpen ? <Close /> : <Hamburger />}
      </button>
      <ul
        className={`flex ${isOpen ? "" : "hidden"} flex-col gap-6 md:flex md:flex-row`}
      >
        {urls().map(({ url, placeholder }, index) => (
          <li key={index} className={"p-2.5"}>
            <NavLink
              to={url}
              className={({ isActive }) => `${isActive ? "text-primary" : ""}`}
            >
              {placeholder}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function urls() {
  return [
    {
      url: "/",
      placeholder: "Home",
    },
    {
      url: "/about",
      placeholder: "About",
    },
    {
      url: "/services",
      placeholder: "Services",
    },
    {
      url: "/contact",
      placeholder: "Contact",
    },
  ];
}
