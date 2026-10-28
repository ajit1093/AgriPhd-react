import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // ─── Professional Ph.D. Admission Portal Theme Palette ──────────────────
      colors: {
        // Academic Navy: Authority, doctoral credibility, institutional prestige
        primary: {
          50:  '#f0f6fa',
          100: '#e0ecf4',
          200: '#c2d9ea',
          300: '#95bedc',
          400: '#619ec9',
          500: '#3c82b4',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e3a8a',
          900: '#0f2942',
          950: '#091a2b',
          DEFAULT: '#0f2942',
        },
        // Dedicated academic branding tokens
        academic: {
          navy: '#0f2942',
          navyDark: '#091a2b',
          navyLight: '#183b5e',
          accent: '#1d4ed8',
          gold: '#d97706',
          goldLight: '#fef3c7',
          goldDark: '#92400e',
        },
        // Agricultural Emerald: Honoring Maharashtra Agricultural Research & Sciences
        agriculture: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          DEFAULT: '#15803d',
        },
        // Navigation bar: Official deep academic navy
        navbar: '#0f2942',
        navHover: '#1c4566',

        // Header buttons
        signup: { DEFAULT: '#15803d', hover: '#166534' },
        signin: { DEFAULT: '#eff6ff', hover: '#dbeafe', text: '#1d4ed8' },

        // Notice and Announcement ticker
        announcement: { bg: '#f8fafc', text: '#0f2942', border: '#e2e8f0', badge: '#1d4ed8' },
        marqueeBtn: '#1d4ed8',

        // Academic tabs
        tab: {
          normal: '#f1f5f9',
          activeBg: '#0f2942',
          activeText: '#ffffff',
          hover: '#e2e8f0',
        },
        tabContent: '#ffffff',
        tabBorder: '#e2e8f0',
        listBorder: '#e2e8f0',
        dateBadge: { span: '#dbeafe', em: '#1d4ed8' },

        // Institutional footer
        footer: { DEFAULT: '#0f172a', link: '#93c5fd', border: '#334155' },

        // Body typography color
        body: '#334155',

        // Secondary / distinctions (warm gold/amber)
        secondary: {
          DEFAULT: '#d97706',
          light: '#fef3c7',
          dark: '#92400e',
        },

        // Semantic status tokens (WCAG AA compliant)
        danger: {
          DEFAULT: '#dc2626',
          light: '#fef2f2',
          dark: '#991b1b',
          border: '#fecaca',
        },
        warning: {
          DEFAULT: '#d97706',
          light: '#fffbeb',
          dark: '#92400e',
          border: '#fde68a',
        },
        success: {
          DEFAULT: '#16a34a',
          light: '#f0fdf4',
          dark: '#14532d',
          border: '#bbf7d0',
        },
        info: {
          DEFAULT: '#0284c7',
          light: '#f0f9ff',
          dark: '#0c4a6e',
          border: '#bae6fd',
        },

        // Modern Slate neutrals
        neutral: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },

      // ─── Modern High-Legibility Academic Typography ─────────────────────────
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.75rem',   { lineHeight: '1.1rem' }],   // 12px
        'xs':  ['0.8125rem', { lineHeight: '1.25rem' }],  // 13px
        'sm':  ['0.875rem',  { lineHeight: '1.35rem' }],  // 14px (standard readable)
        'base':['1rem',      { lineHeight: '1.5rem' }],   // 16px (standard readable body)
        'md':  ['1.0625rem', { lineHeight: '1.6rem' }],   // 17px
        'lg':  ['1.125rem',  { lineHeight: '1.75rem' }],  // 18px
        'xl':  ['1.25rem',   { lineHeight: '1.75rem' }],  // 20px
        '2xl': ['1.5rem',    { lineHeight: '2rem' }],     // 24px
        '3xl': ['1.875rem',  { lineHeight: '2.25rem' }],  // 30px
        '4xl': ['2.25rem',   { lineHeight: '2.5rem' }],   // 36px
      },

      // ─── Spacing scale ─────────────────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // ─── Standardized Border Radii ─────────────────────────────────────────
      borderRadius: {
        'sm': '0.25rem', // 4px
        'DEFAULT': '0.375rem', // 6px
        'md': '0.5rem', // 8px
        'lg': '0.75rem', // 12px
        'xl': '1rem', // 16px
        '2xl': '1.25rem', // 20px
      },

      // ─── Refined Elevations ────────────────────────────────────────────────
      boxShadow: {
        'subtle': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 6px -2px rgb(0 0 0 / 0.04)',
        'dropdown': '0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
        'modal': '0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },

      // ─── Marquee Animation ─────────────────────────────────────────────────
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'marquee': 'marquee 35s linear infinite',
      },
    },
  },
  plugins: [
    forms({ strategy: 'class' }),
  ],
}

export default config
