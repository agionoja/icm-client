import type { Config } from "tailwindcss";

export default {
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
        "bg-clr": "#FFFFFF",
        "settings-nav-clr": "#13196B",
        "settings-bg-clr": "#EAEBFF",
        "footer-clr": "#151515",
      },

      backgroundImage: {
        "auth-pattern-mobile":
          "url('/app/routes/auth/assets/auth-pattern-mobile.png')",
        "auth-pattern-desktop":
          "url('/app/routes/auth/assets/auth-pattern-desktop.png')",
      },

      borderRadius: {
        "4xl": "2rem",
        // xs: "0.375rem",
      },

      fontSize: {
        md: ["1rem", "1.5rem"],
      },

      keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
