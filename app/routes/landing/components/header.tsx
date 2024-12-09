import logo from "~/assets/logos/SVG/Primary Logo - Full Color.svg";
import { Link, NavLink } from "react-router";
import { BlueButton } from "~/components/button";
import { useState } from "react";
import { Close, Hamburger } from "~/components/icons";

export function Header() {
  return (
    <>
      <header
        className={
          "flex w-full items-start justify-between py-6 md:items-center"
        }
      >
        <img width={146} height={40} src={logo} alt="ICM Teach logo" />
        <Nav />
        <Link className={"hidden md:block"} to="/auth/register/welcome">
          <BlueButton>Get Started</BlueButton>
        </Link>
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
