import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";
import { env } from "./app/env-config.server";

// Determine if the environment is Vercel
const isVercel = env.DEPLOYMENT === "vercel";

export default {
  ssr: true,
  presets: isVercel ? [vercelPreset()] : undefined,
  prerender: isVercel ? undefined : ["/", "/about", "/services", "/contact"],
} satisfies Config;

