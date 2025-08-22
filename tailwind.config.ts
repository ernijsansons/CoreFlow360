import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  // Safelist for dynamic classes
  safelist: [
    // Keep dynamic consciousness colors
    'bg-consciousness-neural',
    'bg-consciousness-synaptic', 
    'bg-consciousness-autonomous',
    'bg-consciousness-transcendent',
    // Keep animation classes that might be applied dynamically
    'animate-consciousness-pulse',
    'animate-neural-flow',
    'animate-consciousness-glow',
    // Keep status color variations that are applied dynamically
    'bg-gray-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500',
    'text-gray-700', 'text-blue-700', 'text-green-700', 'text-purple-700', 'text-yellow-700', 'text-red-700'
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Keep existing colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Add our custom colors
        violet: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        cyan: {
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
          950: '#083344',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Consciousness theme colors
        'consciousness-neural': '#2563eb',
        'consciousness-synaptic': '#7c3aed',
        'consciousness-autonomous': '#f59e0b',
        'consciousness-transcendent': '#ffffff',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-ai': 'linear-gradient(135deg, #8b5cf6, #3b82f6, #06b6d4)',
        'gradient-neural': 'linear-gradient(45deg, #8b5cf6, #22d3ee)',
        'gradient-consciousness': 'radial-gradient(circle at center, #7c3aed 0%, #000000 70%)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "data-flow": {
          "0%": { transform: "translateX(-100%) translateY(0px)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateX(100vw) translateY(-20px)", opacity: "0" },
        },
        "consciousness-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(139, 92, 246, 0.6), 0 0 60px rgba(6, 182, 212, 0.3)" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "consciousness-pulse": {
          "0%, 100%": { 
            opacity: "0.4", 
            transform: "scale(1)",
            boxShadow: "0 0 0 0 rgba(124, 58, 237, 0.7)"
          },
          "50%": { 
            opacity: "1", 
            transform: "scale(1.05)",
            boxShadow: "0 0 0 10px rgba(124, 58, 237, 0)"
          },
        },
        "neural-flow": {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "data-flow": "data-flow 12s linear infinite",
        "consciousness-glow": "consciousness-glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "consciousness-pulse": "consciousness-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "neural-flow": "neural-flow 3s ease-in-out infinite",
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config