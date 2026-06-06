import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tokyo Night theme colors
        bg: {
          primary: '#1a1b26',
          secondary: '#24283b',
          input: '#1f2335',
        },
        text: {
          primary: '#c0caf5',
          secondary: '#a9b1d6',
          muted: '#565f89',
        },
        accent: {
          DEFAULT: '#7aa2f7',
          hover: '#89b4fa',
        },
        border: '#3b4261',
        user: '#2a2f4a',
        assistant: '#24283b',
        tool: {
          bg: '#1f2335',
          header: '#2a2f4a',
        },
        success: '#9ece6a',
        error: '#f7768e',
        warning: '#e0af68',
      }
    },
  },
  plugins: [],
} satisfies Config
