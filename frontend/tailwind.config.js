/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Navy & Dark Blue SaaS Palette
        navy: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E3A8A',
          850: '#163A7A', // Primary hover
          900: '#0F2A5F', // Primary dark blue
          950: '#07111F', // Dark theme background
        },
        dark: {
          bg: '#07111F',
          surface: '#0D1B2A',
          elevated: '#13263A',
          border: '#23364D',
          hover: '#1B324B',
          text: '#F8FAFC',
          muted: '#94A3B8',
        },
        brand: {
          primary: '#0F2A5F',
          hover: '#163A7A',
          secondary: '#2563EB',
          accent: '#3B82F6',
          lightBg: '#F8FAFC',
          card: '#FFFFFF',
          text: '#0F172A',
          muted: '#64748B',
          border: '#E2E8F0',
        },
        // Semantic Alerts
        status: {
          success: '#16A34A',
          warning: '#D97706',
          danger: '#DC2626',
          info: '#2563EB',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        // Typography scale ensuring base is 16px and small metadata is 13px
        'xxs': ['0.6875rem', { lineHeight: '0.95rem' }], // 11px
        'xs': ['0.8125rem', { lineHeight: '1.15rem' }],  // 13px (metadata)
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],   // 14px (table, labels)
        'base': ['1rem', { lineHeight: '1.5rem' }],      // 16px (body)
        'lg': ['1.125rem', { lineHeight: '1.65rem' }],   // 18px (card titles)
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],    // 20px (section heading)
        '2xl': ['1.5rem', { lineHeight: '2rem' }],       // 24px (mobile page title)
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],  // 30px (desktop page title / KPIs)
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],    // 36px (large KPIs)
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)',
        'modal': '0 10px 25px -5px rgba(7, 17, 31, 0.2), 0 8px 10px -6px rgba(7, 17, 31, 0.2)',
      },
    },
  },
  plugins: [],
}
