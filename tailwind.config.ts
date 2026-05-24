// Tailwind v4 uses CSS-based configuration via @theme in globals.css
// This file is kept for editor tooling compatibility only.
// All design tokens are defined in src/app/globals.css using @theme {}

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {},
  plugins: [],
};

export default config;
