import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

export default {
  async prerender() {
    return ["/", "/about", "/services", "contact"];
  },
  presets: [vercelPreset()],
} satisfies Config;
