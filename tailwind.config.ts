import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#2563EB', light: '#3B82F6', dark: '#1D4ED8' },
        accent: { DEFAULT: '#7C3AED', light: '#A855F7', dark: '#6D28D9' },
      },
      boxShadow: {
        card: '0 4px 20px -4px rgba(37,99,235,0.08)',
        'card-hover': '0 10px 30px -6px rgba(37,99,235,0.15)',
      },
    },
  },
  plugins: [],
};
export default config;
