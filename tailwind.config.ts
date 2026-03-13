import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Logo kleuren
        'brand-red': '#e53013',
        'brand-green': '#4c8077',
        'brand-orange': '#f7931e',
        'brand-cream': '#fee4cc',
      },
    },
  },
  plugins: [],
};

export default config;
