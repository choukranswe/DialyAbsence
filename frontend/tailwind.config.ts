import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0A4FAF',
        secondary: '#2F7ED8',
        dark: '#072C73',
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
        background: '#F8FAFC',
        surface: '#FFFFFF',
      },
      borderRadius: {
        card: '8px',
      },
      boxShadow: {
        clinic: '0 14px 34px rgba(15, 35, 70, 0.08)',
      },
    },
  },
} satisfies Config;
