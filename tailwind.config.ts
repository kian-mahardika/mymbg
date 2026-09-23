import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          200: '#bce4ff',
          300: '#8ed4ff',
          400: '#59b9ff',
          500: '#3299ff',
          600: '#1a78f5',
          700: '#1460e1',
          800: '#174db6',
          900: '#19458f',
          950: '#122b57'
        },
        gov: {
          50: '#f1f7f5',
          100: '#dcece7',
          200: '#b8ddd0',
          300: '#86c7b2',
          400: '#4eaa8b',
          500: '#17946f',
          600: '#0f7c5d',
          700: '#0b664e',
          800: '#09523f',
          900: '#0b4335'
        },
        navy: {
          700: '#17345d',
          800: '#10294d',
          900: '#0b2241',
          950: '#071a33'
        },
        sunshine: '#FFD95A',
        coral: '#FF7E73',
        mint: '#75D8B0',
        skyfun: '#7CCBFF'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
        institutional: '0 6px 24px rgba(11, 34, 65, 0.07)',
        playful: '0 14px 36px rgba(48, 119, 181, 0.13)'
      }
    }
  },
  plugins: []
};
export default config;
