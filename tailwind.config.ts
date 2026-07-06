import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1440px' },
    },
    extend: {
      colors: {
        // Riot-inspired premium dark palette
        obsidian: {
          950: '#05070b',
          900: '#0a0e14',
          800: '#111721',
          700: '#1a2230',
          600: '#242e3f',
        },
        graphite: {
          500: '#3a4557',
          400: '#5a6478',
          300: '#8b95a9',
        },
        electric: {
          DEFAULT: '#2ee6ff',
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        challenger: {
          DEFAULT: '#f4c874',
          50: '#fffaeb',
          100: '#fff1c6',
          200: '#ffe388',
          300: '#ffcf4a',
          400: '#ffb920',
          500: '#f4c874',
          600: '#c48a10',
          700: '#8a5f11',
          800: '#5a3f0d',
          900: '#3a2909',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        'grid-electric':
          'linear-gradient(rgba(46,230,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(46,230,255,0.06) 1px, transparent 1px)',
        'gradient-hero':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(46,230,255,0.15), transparent), radial-gradient(ellipse 60% 40% at 80% 10%, rgba(244,200,116,0.08), transparent)',
        'gradient-challenger':
          'linear-gradient(135deg, #f4c874 0%, #ffb920 50%, #c48a10 100%)',
        'gradient-electric':
          'linear-gradient(135deg, #2ee6ff 0%, #06b6d4 50%, #0e7490 100%)',
      },
      boxShadow: {
        glow: '0 0 24px rgba(46,230,255,0.35)',
        'glow-gold': '0 0 24px rgba(244,200,116,0.35)',
        glass: '0 8px 32px 0 rgba(0,0,0,0.5)',
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
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse_glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(46,230,255,0.35)' },
          '50%': { boxShadow: '0 0 40px rgba(46,230,255,0.6)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 3s linear infinite',
        'pulse-glow': 'pulse_glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
