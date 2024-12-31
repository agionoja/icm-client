import { routesConfig as Routes } from "./routes.config";
import {
  index,
  layout,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

const { account, landing, auth, resources } = Routes;
const { settings, user, admin } = account;

export default [
  // Landing Routes
  layout(landing.layout.getFile, [
    index(landing.home.getFile),
    route(landing.services.getPath, landing.services.getFile),
    route(landing.contact.getPath, landing.contact.getFile),
    route(landing.about.getPath, landing.about.getFile),
  ]),

  // Authentication Routes
  route(auth.logout.getPath, auth.logout.getFile),
  layout(auth.layout.getFile, [
    route(auth.login.getPath, auth.login.getFile),
    route(auth.register.getPath, auth.register.getFile),
    route(auth.registerWelcome.getPath, auth.registerWelcome.getFile),
    route(auth.registerOptions.getPath, auth.registerOptions.getFile),
    route(auth.registerEmail.getPath, auth.registerEmail.getFile),
    route(auth.registerPassword.getPath, auth.registerPassword.getFile),
    route(auth.registerOtp.getPath, auth.registerOtp.getFile),
    route(auth.forgotPassword.getPath, auth.forgotPassword.getFile),
    route(auth.resetPassword.getPath, auth.resetPassword.getFile),
  ]),

  // Account Routes - Settings, User, Admin
  layout(account.layout.getFile, [
    // Settings Routes
    route(settings.route.getPath, settings.route.getFile, [
      index(settings.index.getFile),
      route(settings.personalInfo.getPath, settings.personalInfo.getFile),
      route(settings.configuration.getPath, settings.configuration.getFile),
      route(settings.security.getPath, settings.security.getFile),
    ]),

    // User Routes
    layout(user.layout.getFile, [
      route(user.airline.getPath, user.airline.getFile),
      route(user.airtime.getPath, user.airtime.getFile),
      route(user.cable.getPath, user.cable.getFile),
      route(user.crypto.getPath, user.crypto.getFile),
      route(user.dashboard.getPath, user.dashboard.getFile),
      route(user.data.getPath, user.data.getFile),
      route(user.giftCard.getPath, user.giftCard.getFile),
      route(user.wallet.getPath, user.wallet.getFile),
      route(user.transactions.getPath, user.transactions.getFile),
    ]),

    // Admin Routes
    layout(admin.layout.getFile, [
      route(admin.airline.getPath, admin.airline.getFile),
      route(admin.airtime.getPath, admin.airtime.getFile),
      route(admin.analytics.getPath, admin.analytics.getFile),
      route(admin.cable.getPath, admin.cable.getFile),
      route(admin.crypto.getPath, admin.crypto.getFile),
      route(admin.dashboard.getPath, admin.dashboard.getFile),
      route(admin.data.getPath, admin.data.getFile),
      route(admin.giftCard.getPath, admin.giftCard.getFile),
      route(admin.wallet.getPath, admin.wallet.getFile, [
        route(admin.addWallet.getPath, admin.addWallet.getFile),
      ]),
      route(admin.services.getPath, admin.services.getFile),
      route(admin.tv.getPath, admin.tv.getFile),
      route(admin.users.getPath, admin.users.getFile),
    ]),
  ]),

  // Resources Routes
  route(resources.spinServer.getPath, resources.spinServer.getFile),
] satisfies RouteConfig;
