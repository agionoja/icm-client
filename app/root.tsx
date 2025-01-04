import type { Route } from "./+types/root";
import {
  data,
  isRouteErrorResponse,
  Links,
  type LinksFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import "./app.css";
import { type ReactNode, useEffect } from "react";
import { Bounce, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-international-phone/style.css";
import { getToast } from "remix-toast";
import { cn } from "~/lib/utils";

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

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  // Extract route checking logic into a separate function
  const isAccountRoute = (pathname: string): boolean => {
    const authenticatedPaths = ["admin", "user", "settings"];
    return authenticatedPaths.some((path) => pathname.includes(path));
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        className={cn(
          isAccountRoute(location.pathname) ? "bg-account-bg" : "bg-landing",
        )}
      >
        <ToastContainer
          autoClose={5000}
          draggable={true}
          theme="light"
          transition={Bounce}
        />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// export function shouldRevalidate({
//   defaultShouldRevalidate,
// }: {
//   defaultShouldRevalidate: boolean;
// }) {
//   return defaultShouldRevalidate;
// }

export async function loader({ request }: Route.LoaderArgs) {
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
    if (loaderData.toast)
      toast(loaderData.toast.message, {
        type: loaderData.toast.type,
      });
  }, [loaderData.toast]);

  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
