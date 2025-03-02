const BASE_PATHS = {
  AUTH: "/auth",
  TRANSACTIONS: "/transactions",
} as const;

export default {
  transactions: {
    wallet: {
      verify: (reference: string) =>
        `${BASE_PATHS.TRANSACTIONS}/wallet/verify/${reference}` as const,
    },
  },

  auth: {
    login: `${BASE_PATHS.AUTH}/login` as const,
    facebook: `${BASE_PATHS.AUTH}/login/facebook` as const,
    google: `${BASE_PATHS.AUTH}/login/google` as const,
    register: `${BASE_PATHS.AUTH}/register` as const,
    checkUser: `${BASE_PATHS.AUTH}/check-user` as const,
    forgotPassword: `${BASE_PATHS.AUTH}/forgot-password` as const,
    resetPassword: `${BASE_PATHS.AUTH}/reset-password` as const,
    profile: `${BASE_PATHS.AUTH}/profile` as const,
    updateMyPassword: `${BASE_PATHS.AUTH}/me/password` as const,
    updateMyEmail: (token: string) =>
      `${BASE_PATHS.AUTH}/me/email/${token}` as const,
    verifyAccount: (token: string) =>
      `${BASE_PATHS.AUTH}/verify/${token}` as const,
  },
} as const;
