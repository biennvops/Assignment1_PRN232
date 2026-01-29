import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      colors: {
        primary: {
          50: "#fdf4f3",
          100: "#fce8e6",
          200: "#f9d5d1",
          300: "#f4b5ae",
          400: "#ec8a80",
          500: "#e06356",
          600: "#cc4638",
          700: "#ab382c",
          800: "#8e3229",
          900: "#762f28",
        },
      },
    },
  },
  plugins: [],
};

export default config;
