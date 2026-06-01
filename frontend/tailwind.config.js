export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#ffffff',
        surface2: '#f1f5f9',
        surface3: '#e2e8f0',
        border: '#e2e8f0',
        accent: '#6366f1',
        accent2: '#ec4899',
        textPrimary: '#0f172a',
        textSecondary: '#475569',
        textMuted: '#94a3b8',
        success: '#16a34a',
        error: '#dc2626',
        warning: '#f59e0b',
      },
      boxShadow: {
        glow: '0 20px 40px rgba(99, 102, 241, 0.12)',
      },
      borderRadius: {
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}
