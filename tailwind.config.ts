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
        cream: '#f5f0e8', 'cream-dark': '#ede7d9',
        forest: '#002d1c', 'forest-mid': '#1a4a32', 'forest-light': '#2d6b4a',
        sage: '#8fbc8b', 'sage-light': '#c8e6c0',
        amber: '#c17f2a', 'amber-light': '#f0c96a', 'amber-pale': '#fdf3d8',
        clay: '#8b4513', stone: '#717973',
        'on-forest': '#ffffff', error: '#ba1a1a', 'error-light': '#ffdad6'
      },
      fontFamily: { 
        headline: ['var(--font-fraunces)', 'serif'], 
        body: ['var(--font-be-vietnam-pro)', 'sans-serif'] 
      },
      keyframes: {
        up: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fade: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } }
      },
      animation: {
        up: 'up 0.4s cubic-bezier(0.22,1,0.36,1) both',
        fade: 'fade 0.35s ease both',
        scaleIn: 'scaleIn 0.35s cubic-bezier(0.22,1,0.36,1) both'
      }
    },
  },
  plugins: [],
};
export default config;
