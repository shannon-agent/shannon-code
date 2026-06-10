import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* shadcn/ui standard semantic tokens → CSS variables */
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

        /* Semantic status colors */
        success: 'var(--success)',
        warning: 'var(--warning)',
        info: 'var(--info)',
        error: 'var(--error)',
        running: 'var(--running)',
        cancelled: 'var(--cancelled)',

        /* Chat role backgrounds */
        'user-bg': 'var(--user-bg)',
        'assistant-bg': 'var(--assistant-bg)',
        'tool-bg': 'var(--tool-bg)',
        'tool-header-bg': 'var(--tool-header-bg)',

        /* Extra accent colors */
        purple: 'var(--purple)',
        cyan: 'var(--cyan)',

        /* Extra surfaces */
        tertiary: 'var(--bg-tertiary)',
        glass: {
          bg: 'var(--glass-bg)',
          border: 'var(--glass-border)',
        },

        /* Material Design 3 tokens — direct access */
        'md3-primary': 'var(--md3-primary)',
        'md3-primary-container': 'var(--md3-primary-container)',
        'md3-on-primary': 'var(--md3-on-primary)',
        'md3-on-primary-container': 'var(--md3-on-primary-container)',
        'md3-primary-fixed': 'var(--md3-primary-fixed)',
        'md3-primary-fixed-dim': 'var(--md3-primary-fixed-dim)',
        'md3-on-primary-fixed': 'var(--md3-on-primary-fixed)',
        'md3-on-primary-fixed-variant': 'var(--md3-on-primary-fixed-variant)',
        'md3-secondary': 'var(--md3-secondary)',
        'md3-secondary-container': 'var(--md3-secondary-container)',
        'md3-on-secondary': 'var(--md3-on-secondary)',
        'md3-on-secondary-container': 'var(--md3-on-secondary-container)',
        'md3-tertiary': 'var(--md3-tertiary)',
        'md3-tertiary-container': 'var(--md3-tertiary-container)',
        'md3-on-tertiary': 'var(--md3-on-tertiary)',
        'md3-on-tertiary-container': 'var(--md3-on-tertiary-container)',
        'md3-tertiary-fixed': 'var(--md3-tertiary-fixed)',
        'md3-tertiary-fixed-dim': 'var(--md3-tertiary-fixed-dim)',
        'md3-on-tertiary-fixed': 'var(--md3-on-tertiary-fixed)',
        'md3-on-tertiary-fixed-variant': 'var(--md3-on-tertiary-fixed-variant)',
        'md3-error': 'var(--md3-error)',
        'md3-error-container': 'var(--md3-error-container)',
        'md3-on-error': 'var(--md3-on-error)',
        'md3-on-error-container': 'var(--md3-on-error-container)',
        'md3-surface': 'var(--md3-surface)',
        'md3-surface-dim': 'var(--md3-surface-dim)',
        'md3-surface-bright': 'var(--md3-surface-bright)',
        'md3-surface-container-lowest': 'var(--md3-surface-container-lowest)',
        'md3-surface-container-low': 'var(--md3-surface-container-low)',
        'md3-surface-container': 'var(--md3-surface-container)',
        'md3-surface-container-high': 'var(--md3-surface-container-high)',
        'md3-surface-container-highest': 'var(--md3-surface-container-highest)',
        'md3-on-surface': 'var(--md3-on-surface)',
        'md3-on-surface-variant': 'var(--md3-on-surface-variant)',
        'md3-inverse-surface': 'var(--md3-inverse-surface)',
        'md3-inverse-on-surface': 'var(--md3-inverse-on-surface)',
        'md3-outline': 'var(--md3-outline)',
        'md3-outline-variant': 'var(--md3-outline-variant)',
        'md3-background': 'var(--md3-background)',
        'md3-on-background': 'var(--md3-on-background)',
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        glass: 'var(--glass-shadow)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist', 'ui-monospace', 'SF Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        'label-sm': ['var(--text-label-sm)', { lineHeight: 'var(--text-label-sm--line-height)', letterSpacing: 'var(--text-label-sm--letter-spacing)', fontWeight: 'var(--text-label-sm--font-weight)' }],
        'label-md': ['var(--text-label-md)', { lineHeight: 'var(--text-label-md--line-height)', letterSpacing: 'var(--text-label-md--letter-spacing)', fontWeight: 'var(--text-label-md--font-weight)' }],
        'body-sm': ['var(--text-body-sm)', { lineHeight: 'var(--text-body-sm--line-height)', fontWeight: 'var(--text-body-sm--font-weight)' }],
        'body-md': ['var(--text-body-md)', { lineHeight: 'var(--text-body-md--line-height)', fontWeight: 'var(--text-body-md--font-weight)' }],
        'body-lg': ['var(--text-body-lg)', { lineHeight: 'var(--text-body-lg--line-height)', fontWeight: 'var(--text-body-lg--font-weight)' }],
        'headline-md': ['var(--text-headline-md)', { lineHeight: 'var(--text-headline-md--line-height)', fontWeight: 'var(--text-headline-md--font-weight)' }],
        'headline-lg': ['var(--text-headline-lg)', { lineHeight: 'var(--text-headline-lg--line-height)', letterSpacing: 'var(--text-headline-lg--letter-spacing)', fontWeight: 'var(--text-headline-lg--font-weight)' }],
        'display-lg': ['var(--text-display-lg)', { lineHeight: 'var(--text-display-lg--line-height)', letterSpacing: 'var(--text-display-lg--letter-spacing)', fontWeight: 'var(--text-display-lg--font-weight)' }],
      },
      spacing: {
        'sidebar': 'var(--spacing-sidebar-width)',
        'max-content': 'var(--spacing-max-content-width)',
        'gutter': 'var(--spacing-gutter)',
        'md3-xs': 'var(--spacing-xs)',
        'md3-sm': 'var(--spacing-sm)',
        'md3-md': 'var(--spacing-md)',
        'md3-lg': 'var(--spacing-lg)',
        'md3-xl': 'var(--spacing-xl)',
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
        'animate-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'pulse-amber': {
          '0%': { boxShadow: '0 0 0 0 rgba(167, 101, 0, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(167, 101, 0, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(167, 101, 0, 0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'animate-in': 'animate-in 0.7s ease-out forwards',
        'pulse-amber': 'pulse-amber 2s infinite',
      },
      transitionDuration: {
        '700': '700ms',
      },
    },
  },
  plugins: [],
} satisfies Config
