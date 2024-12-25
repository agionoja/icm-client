import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Inter"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      colors: {
        primary: "#2D3BFF",
        landing: "#FFFFFF",
        footer: "#151515",
        // "sidebar-button": "#EAEBFF",
        "account-bg": "#EAEBFF",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundImage: {
        "auth-pattern-mobile":
          'url("/app/routes/auth/assets/auth-pattern-mobile.png")',
        "auth-pattern-desktop":
          'url("/app/routes/auth/assets/auth-pattern-desktop.png")',
      },
      borderRadius: {
        "4xl": "2rem",
      },
      fontSize: {
        md: ["1rem", "1.5rem"],
      },
      keyframes: {
        "caret-blink": {
          "0%,70%,100%": {
            opacity: "1",
          },
          "20%,50%": {
            opacity: "0",
          },
        },
      },
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
      width: {
        "sidebar-width-mobile": "var(--sidebar-width-mobile)",
        "sidebar-width-md": "var(--sidebar-width-md)",
        "sidebar-with-desktop": "var(--sidebar-width-desktop)",
      },
    },
  },
  plugins: [],
} satisfies Config;
