import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

export default {
  ssr: true,
  presets: import.meta.env.PROD ? [vercelPreset()] : [],
  // prerender: async () => ["/", "/about", "/services", "contact"],
} satisfies Config;
