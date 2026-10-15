/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        route: {
          bg: '#090D16',
          surface: '#111827',
          card: '#161F30',
          border: '#1F293D',
          hover: '#24324D',
          primary: '#6366F1',
          primaryLight: '#818CF8',
          accent: '#06B6D4',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          cultural: '#EC4899',
          sports: '#F97316',
          text: '#F3F4F6',
          muted: '#9CA3AF',
          dim: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px -5px rgba(99, 102, 241, 0.4)',
        glowEmerald: '0 0 20px -5px rgba(16, 185, 129, 0.4)',
        glowCyan: '0 0 20px -5px rgba(6, 182, 212, 0.4)',
      }
    },
  },
  plugins: [],
}
