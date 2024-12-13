import {
  type RouteConfig,
  prefix,
  layout,
  index,
  route,
} from "@react-router/dev/routes";

const landing = (path: string) =>
  `./routes/landing/${path}${path.endsWith(".tsx") || path.endsWith(".ts") ? "" : ".tsx"}`;

const auth = (path: string) =>
  `./routes/auth/${path}${path.endsWith(".tsx") || path.endsWith(".ts") ? "" : ".tsx"}`;

const user = (path: string) =>
  `./routes/account/user/${path}${path.endsWith(".tsx") || path.endsWith(".ts") ? "" : ".tsx"}`;

const admin = (path: string) =>
  `./routes/account/admin/${path}${path.endsWith(".tsx") || path.endsWith(".ts") ? "" : ".tsx"}`;

const settings = (path: string) =>
  `./routes/account/settings/${path}${path.endsWith(".tsx") || path.endsWith(".ts") ? "" : ".tsx"}`;

export default [
  layout(landing("layout/route"), [
    index(landing("home/route")),
    route("services", landing("services/route")),
    route("contact", landing("contact/route")),
    route("about", landing("about/route")),
  ]),

  ...prefix("auth", [
    route("logout", auth("logout.ts")),
    layout(auth("layout/route"), [
      route("login", auth("login/route")),
      route("register", auth("register/route")),
      route("register/welcome", auth("welcome/route")),
      route("register/options", auth("register-options/route")),
      route("register/email", auth("register-email/route")),
      route("register/password", auth("register-password/route")),
      route("register/otp", auth("register-otp/route")),
      route("forgot-password", auth("forgot-password/route")),
      route("reset-password/:token", auth("reset-password/route")),
    ]),
  ]),

  layout("./routes/account/layout/route.tsx", [
    ...prefix("settings", [
      layout(settings("layout/route"), [
        route("personal-info", settings("personal-info/route")),
        route("configuration", settings("configuration/route")),
        route("security", settings("security/route")),
      ]),
    ]),

    ...prefix("user", [
      layout(user("layout/route"), [
        route("airline", user("airline/route")),
        route("airtime", user("airtime/route")),
        route("cable", user("cable/route")),
        route("crypto", user("crypto/route")),
        route("dashboard", user("dashboard/route")),
        route("data", user("data/route")),
        route("gift-card", user("gift-card/route")),
        route("wallet", user("wallet/route")),
        route("transactions", user("transactions/route")),
      ]),
    ]),

    ...prefix("admin", [
      layout(admin("layout/route"), [
        route("airline", admin("airline/route")),
        route("airtime", admin("airtime/route")),
        route("analytics", admin("analytics/route")),
        route("cable", admin("cable/route")),
        route("crypto", admin("crypto/route")),
        route("dashboard", admin("dashboard/route")),
        route("data", admin("data/route")),
        route("gift-card", admin("gift-card/route")),
        route("wallet", admin("wallets/route"), [
          route("add-wallet", admin("wallets/add-wallet/route")),
        ]),
        route("services", admin("services/route")),
        route("tv", admin("tv/route")),
        route("users", admin("users/route")),
      ]),
    ]),
  ]),

  ...prefix("resource", []),
] satisfies RouteConfig;
