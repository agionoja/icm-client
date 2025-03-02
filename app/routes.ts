import {
  type RouteConfig,
  index,
  layout,
  route,
  prefix,
} from "@react-router/dev/routes";

export default [
  // Landing Routes
  layout("routes/landing/layout/route.tsx", [
    index("routes/landing/home/route.tsx"),
    route("services", "routes/landing/services/route.tsx"),
    route("contact", "routes/landing/contact/route.tsx"),
    route("about", "routes/landing/about/route.tsx"),
  ]),

  // Authentication Routes
  route("auth/logout", "routes/auth/logout.ts"),
  layout(
    "routes/auth/layout/route.tsx",
    prefix("auth", [
      route("login", "routes/auth/login/route.tsx"),
      route("register", "routes/auth/register/route.tsx"),
      route("register/welcome", "routes/auth/welcome/route.tsx"),
      route("register/options", "routes/auth/register-options/route.tsx"),
      route("register/email", "routes/auth/register-email/route.tsx"),
      route("register/password", "routes/auth/register-password/route.tsx"),
      route("register/otp", "routes/auth/register-otp/route.tsx"),
      route("forgot-password", "routes/auth/forgot-password/route.tsx"),
      route("reset-password/:token", "routes/auth/reset-password/route.tsx"),
    ]),
  ),

  // Account Routes
  layout("routes/account/layout/route.tsx", [
    // Settings Routes
    route("settings", "routes/account/settings/route.tsx", [
      index("routes/account/settings/index/route.ts"),
      route("personal-info", "routes/account/settings/personal-info/route.tsx"),
      route("configuration", "routes/account/settings/configuration/route.tsx"),
      route("security", "routes/account/settings/security/route.tsx"),
    ]),

    // User Routes
    layout(
      "routes/account/user/layout/route.tsx",
      prefix("", [
        route("dashboard", "routes/account/user/dashboard/route.tsx"),
        route("airline", "routes/account/user/airline/route.tsx"),
        route("airtime", "routes/account/user/airtime/route.tsx"),
        route("cable", "routes/account/user/cable/route.tsx"),
        route("crypto", "routes/account/user/crypto/route.tsx"),
        route("data", "routes/account/user/data/route.tsx"),
        route("gift-card", "routes/account/user/gift-card/route.tsx"),
        route("wallet", "routes/account/user/wallet/route.tsx", [
          route(
            "fund-wallet",
            "routes/account/user/wallet/fund-wallet/route.tsx",
          ),
        ]),
        route(
          "transactions/:id/wow/:token",
          "routes/account/user/transactions/route.tsx",
        ),
      ]),
    ),

    // Admin Routes
    layout(
      "routes/account/admin/layout/route.tsx",
      prefix("admin", [
        route("dashboard", "routes/account/admin/dashboard/route.tsx"),
        route("airline", "routes/account/admin/airline/route.tsx"),
        route("airtime", "routes/account/admin/airtime/route.tsx"),
        route("analytics", "routes/account/admin/analytics/route.tsx"),
        route("cable", "routes/account/admin/cable/route.tsx"),
        route("crypto", "routes/account/admin/crypto/route.tsx"),
        route("data", "routes/account/admin/data/route.tsx"),
        route("gift-card", "routes/account/admin/gift-card/route.tsx"),
        route("wallets", "routes/account/admin/wallets/route.tsx", [
          route(
            "add-wallet",
            "routes/account/admin/wallets/add-wallet/route.tsx",
          ),
        ]),
        route("services", "routes/account/admin/services/route.tsx"),
        route("tv", "routes/account/admin/tv/route.tsx"),
        route("users", "routes/account/admin/users/route.tsx"),
        route("users/:id", "routes/account/admin/user/route.tsx"),
      ]),
    ),
  ]),

  // Resources Routes
  ...prefix("resources", [
    route("spin-server", "routes/resources/spin-server.ts"),
    route("fund-wallet/:reference", "routes/resources/wallet.ts"),
    route("user/:id", "routes/resources/user.ts"),
  ]),
] satisfies RouteConfig;
