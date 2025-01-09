import { defineRoute } from "./utils/route-config-utils";
import { z } from "zod";

// Utility function to generate file paths
const createPathResolver =
  (basePath: string) =>
  (path: string, extension: "tsx" | "ts" = "tsx") =>
    `${basePath}/${path}${path.endsWith(`.${extension}`) ? "" : `.${extension}`}`;

// Route file path resolvers
const paths = {
  landing: createPathResolver("./routes/landing"),
  auth: createPathResolver("./routes/auth"),
  user: createPathResolver("./routes/account/user"),
  admin: createPathResolver("./routes/account/admin"),
  settings: createPathResolver("./routes/account/settings"),
  resources: createPathResolver("./routes/resources"),
};

export const routesConfig = {
  // Landing Routes
  landing: {
    prefix: "",
    layout: defineRoute({
      path: "",
      file: paths.landing("layout/route"),
    }),
    home: defineRoute({
      path: "/",
      file: paths.landing("home/route"),
    }),
    services: defineRoute({
      path: "/services",
      file: paths.landing("services/route"),
    }),
    contact: defineRoute({
      path: "/contact",
      file: paths.landing("contact/route"),
    }),
    about: defineRoute({
      path: "/about",
      file: paths.landing("about/route"),
    }),
  },

  // Authentication Routes
  auth: {
    layout: defineRoute({
      path: "",
      file: paths.auth("layout/route"),
    }),
    login: defineRoute({
      path: "/auth/login",
      file: paths.auth("login/route"),
      queryParams: {
        redirect: z.string(),
      },
    }),
    logout: defineRoute({
      path: "/auth/logout",
      file: paths.auth("logout", "ts"),
      queryParams: { redirect: z.string().nullable().default("/") },
    }),
    register: defineRoute({
      path: "/auth/register",
      file: paths.auth("register/route"),
    }),
    registerWelcome: defineRoute({
      path: "/auth/register/welcome",
      file: paths.auth("welcome/route"),
    }),
    registerOptions: defineRoute({
      path: "/auth/register/options",
      file: paths.auth("register-options/route"),
    }),
    registerEmail: defineRoute({
      path: "/auth/register/email",
      file: paths.auth("register-email/route"),
    }),
    registerPassword: defineRoute({
      path: "/auth/register/password",
      file: paths.auth("register-password/route"),
    }),
    registerOtp: defineRoute({
      path: "/auth/register/otp",
      file: paths.auth("register-otp/route"),
    }),
    forgotPassword: defineRoute({
      path: "/auth/forgot-password",
      file: paths.auth("forgot-password/route"),
    }),
    resetPassword: defineRoute({
      path: "/auth/reset-password/:token",
      file: paths.auth("reset-password/route"),
      params: {
        token: z.string(),
      },
    }),
  },

  // Account Routes
  account: {
    prefix: "",
    layout: defineRoute({
      path: "",
      file: "./routes/account/layout/route.tsx",
    }),

    // Settings Routes
    settings: {
      route: defineRoute({
        path: "/settings",
        file: paths.settings("route"),
      }),
      index: defineRoute({
        path: "/settings",
        file: paths.settings("index/route", "ts"),
      }),
      personalInfo: defineRoute({
        path: "/settings/personal-info",
        file: paths.settings("personal-info/route"),
      }),
      configuration: defineRoute({
        path: "/settings/configuration",
        file: paths.settings("configuration/route"),
      }),
      security: defineRoute({
        path: "/settings/security",
        file: paths.settings("security/route"),
      }),
    },

    // User Routes
    user: {
      layout: defineRoute({
        path: "",
        file: paths.user("layout/route"),
      }),
      transactions: defineRoute({
        path: "/user/transactions/:id/wow/:token",
        file: paths.user("transactions/route"),
        params: {
          id: z.string(),
          token: z.string(),
        },
      }),
      airline: defineRoute({
        path: "/user/airline",
        file: paths.user("airline/route"),
      }),
      airtime: defineRoute({
        path: "/user/airtime",
        file: paths.user("airtime/route"),
      }),
      cable: defineRoute({
        path: "/user/cable",
        file: paths.user("cable/route"),
      }),
      crypto: defineRoute({
        path: "/user/crypto",
        file: paths.user("crypto/route"),
      }),
      dashboard: defineRoute({
        path: "/user/dashboard",
        file: paths.user("dashboard/route"),
      }),
      data: defineRoute({
        path: "/user/data",
        file: paths.user("data/route"),
      }),
      giftCard: defineRoute({
        path: "/user/gift-card",
        file: paths.user("gift-card/route"),
      }),
      wallet: defineRoute({
        path: "/user/wallet",
        file: paths.user("wallet/route"),
      }),
    },

    // Admin Routes
    admin: {
      layout: defineRoute({
        path: "",
        file: paths.admin("layout/route"),
      }),
      airline: defineRoute({
        path: "/admin/airline",
        file: paths.admin("airline/route"),
      }),
      airtime: defineRoute({
        path: "/admin/airtime",
        file: paths.admin("airtime/route"),
      }),
      analytics: defineRoute({
        path: "/admin/analytics",
        file: paths.admin("analytics/route"),
      }),
      cable: defineRoute({
        path: "/admin/cable",
        file: paths.admin("cable/route"),
      }),
      crypto: defineRoute({
        path: "/admin/crypto",
        file: paths.admin("crypto/route"),
      }),
      dashboard: defineRoute({
        path: "/admin/dashboard",
        file: paths.admin("dashboard/route"),
      }),
      data: defineRoute({
        path: "/admin/data",
        file: paths.admin("data/route"),
      }),
      giftCard: defineRoute({
        path: "/admin/gift-card",
        file: paths.admin("gift-card/route"),
      }),
      wallet: defineRoute({
        path: "/admin/wallet",
        file: paths.admin("wallets/route"),
      }),
      addWallet: defineRoute({
        path: "/admin/wallet/add-wallet",
        file: paths.admin("wallets/add-wallet/route"),
      }),
      services: defineRoute({
        path: "/admin/services",
        file: paths.admin("services/route"),
      }),
      tv: defineRoute({
        path: "/admin/tv",
        file: paths.admin("tv/route"),
      }),
      users: defineRoute({
        path: "/admin/users",
        file: paths.admin("users/route"),
        queryParams: {
          page: z.string().nullable().default("1"),
          limit: z.string().nullable().default("10"),
        },
      }),
      user: defineRoute({
        path: "/admin/users/:id",
        params: { id: z.string() },
        file: paths.admin("user/route"),
      }),
    },
  },

  // Resources Routes
  resources: {
    prefix: "resources",
    spinServer: defineRoute({
      path: "resources/spin-server",
      file: paths.resources("spin-server", "ts"),
    }),
  },
};
export const accountRouteConfig = routesConfig.account;
export const userRouteConfig = routesConfig.account.user;
export const adminRouteConfig = routesConfig.account.admin;
export const settingsRouteConfig = routesConfig.account.settings;
export const authRouteConfig = routesConfig.auth;
export const landingRouteConfig = routesConfig.landing;
export const resourcesRouteConfig = routesConfig.resources;
