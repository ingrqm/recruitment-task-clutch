/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(150 6% 3%)',
        foreground: 'hsl(28 24% 85%)',
        primary: {
          DEFAULT: 'hsl(153 34% 26%)',
          light: 'hsl(153 30% 35%)',
          dark: 'hsl(153 38% 20%)',
          foreground: 'hsl(28 24% 90%)',
        },
        accent: {
          DEFAULT: 'hsl(161 14% 54%)',
          foreground: 'hsl(28 24% 90%)',
        },
        muted: {
          DEFAULT: 'hsl(150 6% 12%)',
          foreground: 'hsl(20 10% 55%)',
        },
        card: {
          DEFAULT: 'hsl(150 6% 10%)',
          elevated: 'hsl(150 6% 14%)',
          foreground: 'hsl(28 24% 79%)',
        },
        border: 'hsl(20 10% 20%)',
        input: 'hsl(150 6% 10%)',
        destructive: {
          DEFAULT: 'hsl(0 65% 50%)',
          foreground: 'hsl(28 24% 90%)',
        },
        success: 'hsl(153 34% 40%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
    },
  },
  plugins: [],
};
