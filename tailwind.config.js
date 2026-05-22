/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#ffffff",
        card: "#1a1a1a",
        primary: "#ff6b6b",
        secondary: "#4ecdc4",
        accent: "#ffe66d",
        muted: "#a0a0a0",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle, var(--tw-gradient-from) 0%, transparent 50%)',
      },
      spacing: {
        '25': '100px',
      }
    },
  },
  plugins: [],
};
