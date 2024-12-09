import type { Config } from "@react-router/dev/config";

export default {
  async prerender() {
    return ["/", "/about", "/services", "contact"];
  },
} satisfies Config;
