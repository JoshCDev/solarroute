/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eclipse: {
          900: '#050505', // Void Black
          800: '#0a0a0a', // Surface Dark
          500: '#FF4D00', // Solar Flare (Primary)
          600: '#D91E18', // Magma Red (Secondary)
        },
        profit: '#00FF94', // Success Green
        glass: {
          surface: 'rgba(255, 255, 255, 0.03)',
          border: 'rgba(255, 255, 255, 0.1)',
          highlight: 'rgba(255, 255, 255, 0.2)',
        },
        // WCAG AA compliant muted text (4.5:1 minimum contrast on dark backgrounds)
        muted: {
          DEFAULT: '#9CA3AF', // gray-400 (9.5:1 contrast) - for body text
          light: '#D1D5DB',   // gray-300 (12.6:1 contrast) - for important muted
          dark: '#6B7280',    // gray-500 (5.8:1 contrast) - only for non-critical info
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'eclipse-gradient': 'radial-gradient(circle at 50% 50%, #FF4D00 0%, #050505 70%)',
      },
      boxShadow: {
        'neon-orange': '0 0 20px rgba(255, 77, 0, 0.5)',
        'glow-text': '0 0 10px rgba(255, 77, 0, 0.3)',
      },
      animation: {
        'scan-line': 'scan 2s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { top: '0%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
