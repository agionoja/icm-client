// eslint-disable-next-line import/no-unresolved
import { Route } from "./+types/root";
import {
  data,
  Links,
  LinksFunction,
  LoaderFunctionArgs,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import "./app.css";
import { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-international-phone/style.css";
import { getToast } from "remix-toast";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { toast, headers } = await getToast(request);

  return data(
    { toast },
    {
      headers,
    },
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  useEffect(() => {
    if (loaderData.toast && loaderData.toast)
      toast(loaderData.toast.message, {
        type: loaderData.toast.type,
      });
  }, [loaderData.toast]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ToastContainer theme={"light"} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
