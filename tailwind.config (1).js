/**
 * File: tailwind.config.js
 * Fungsi: Mengatur konfigurasi Tailwind CSS untuk styling tampilan web.
 * Mendefinisikan class yang dapat di-scan pada folder `app/` dan `components/`,
 * serta kustomisasi tema warna gelap (dark theme) yang elegan.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#0b0f19",
          800: "#111827",
          700: "#1f2937",
          600: "#374151",
          500: "#4b5563",
        },
        brand: {
          500: "#6366f1", // Indigo modern
          600: "#4f46e5",
          700: "#4338ca",
        }
      },
      keyframes: {
        pulseFast: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        }
      },
      animation: {
        'pulse-fast': 'pulseFast 1.2s infinite ease-in-out',
      }
    },
  },
  plugins: [],
};
