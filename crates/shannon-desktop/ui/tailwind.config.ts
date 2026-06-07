import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui standard semantic tokens → CSS variables
        background: 'var(--bg-primary)',
        foreground: 'var(--text-primary)',
        card: {
          DEFAULT: 'var(--bg-secondary)',
          foreground: 'var(--text-primary)',
        },
        popover: {
          DEFAULT: 'var(--bg-secondary)',
          foreground: 'var(--text-primary)',
        },
        primary: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--bg-primary)',
        },
        secondary: {
          DEFAULT: 'var(--bg-secondary)',
          foreground: 'var(--text-secondary)',
        },
        muted: {
          DEFAULT: 'var(--bg-input)',
          foreground: 'var(--text-muted)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--bg-primary)',
          hover: 'var(--accent-hover)',
        },
        destructive: {
          DEFAULT: 'var(--error)',
          foreground: 'var(--text-primary)',
        },
        border: 'var(--border)',
        input: 'var(--border)',
        ring: 'var(--accent)',

        // Semantic status colors
        success: 'var(--success)',
        warning: 'var(--warning)',
        info: 'var(--info)',
        error: 'var(--error)',
        running: 'var(--running)',
        cancelled: 'var(--cancelled)',

        // Chat role backgrounds
        'user-bg': 'var(--user-bg)',
        'assistant-bg': 'var(--assistant-bg)',
        'tool-bg': 'var(--tool-bg)',
        'tool-header-bg': 'var(--tool-header-bg)',

        // Extra accent colors
        purple: 'var(--purple)',
        cyan: 'var(--cyan)',

        // Extra surfaces
        tertiary: 'var(--bg-tertiary)',
        glass: {
          bg: 'var(--glass-bg)',
          border: 'var(--glass-border)',
        },
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        glass: 'var(--glass-shadow)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config
