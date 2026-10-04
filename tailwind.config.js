/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#08090c',
        foreground: '#f5f6f8',
        card: '#101218',
        surface: '#15171f',
        primary: '#ff6b6b',
        secondary: '#4ecdc4',
        accent: '#ffb648',
        muted: '#8b8f9a',
        line: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        glow: '0 0 40px -12px rgba(255,107,107,0.45)',
        soft: '0 20px 50px -30px rgba(0,0,0,0.9)',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle, var(--tw-gradient-from) 0%, transparent 50%)',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeInUp: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleUp: {
          from: { opacity: '0', transform: 'scale(0.96) translateY(-4px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease both',
        fadeInUp: 'fadeInUp 0.55s cubic-bezier(0.16,1,0.3,1) both',
        scaleUp: 'scaleUp 0.18s cubic-bezier(0.16,1,0.3,1) both',
        marquee: 'marquee 32s linear infinite',
      },
      spacing: {
        '25': '100px',
      },
    },
  },
  plugins: [],
};
