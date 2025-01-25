import type { Config } from "tailwindcss";

/** @type {import("tailwindcss").Config} */
const config: import("tailwindcss").Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,md,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,md,jsx,tsx,mdx,css}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        serif: ["var(--font-serif)", "serif"],
        display: ["var(--font-display)", "serif"],
        sansAlt: ["var(--font-sans-alt)", "sans-serif"],
      },
      fontWeight: {
        normal: "400",
        bold: "700",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "rgb(var(--color-background))",
        foreground: "rgb(var(--color-foreground))",
        primary: "rgb(var(--color-primary))",
        secondary: "rgb(var(--color-secondary))",
        success: "rgb(var(--color-success))",
        warning: "rgb(var(--color-warning))",
        danger: "rgb(var(--color-danger))",
      },
    },
  },
  variants: {
    extend: {
      fontStyle: ["responsive", "hover", "focus", "active"],
      fontWeight: ["responsive", "hover", "focus", "active"],
    },
  },
  darkMode: "class",
  safelist: [],
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
} satisfies Config;

export default config;
