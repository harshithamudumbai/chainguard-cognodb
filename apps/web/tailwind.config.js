/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        foreground: '#1e293b',
        primary: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
          light: '#e0e7ff',
        },
        card: {
          DEFAULT: '#ffffff',
          hover: '#f1f5f9',
          border: '#e2e8f0',
        },
        muted: {
          DEFAULT: '#64748b',
          light: '#f1f5f9',
        },
        danger: {
          DEFAULT: '#dc2626',
          light: '#fee2e2',
        },
        warning: {
          DEFAULT: '#d97706',
          light: '#fef3c7',
        },
        success: {
          DEFAULT: '#059669',
          light: '#d1fae5',
        },
        info: {
          DEFAULT: '#2563eb',
          light: '#dbeafe',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'elevated': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
}
