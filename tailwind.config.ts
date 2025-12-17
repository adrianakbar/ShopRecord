import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#53d22d",
        "primary-hover": "#42a824",
        "background-light": "#f6f8f6",
        "background-dark": "#152012",
        "surface-dark": "#21301c",
        "surface-light": "#ffffff",
        "surface-input": "#2a3b26",
        "border-dark": "#2e4328",
        "text-muted": "#a2c398",
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
