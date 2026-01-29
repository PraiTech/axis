/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'fluid-xs': 'var(--scale-xs)',
        'fluid-sm': 'var(--scale-sm)',
        'fluid-base': 'var(--scale-base)',
        'fluid-lg': 'var(--scale-lg)',
        'fluid-xl': 'var(--scale-xl)',
        'fluid-2xl': 'var(--scale-2xl)',
        'fluid-3xl': 'var(--scale-3xl)',
      },
      spacing: {
        'sidebar': 'var(--sidebar-w)',
        'sidebar-collapsed': 'var(--sidebar-w-collapsed)',
        'header': 'var(--header-h)',
        'content': 'var(--content-pad)',
        'content-y': 'var(--content-pad-y)',
        'card-gap': 'var(--card-gap)',
      },
      minHeight: {
        'chart': 'var(--chart-min-h)',
      },
      maxHeight: {
        'chart': 'var(--chart-max-h)',
      },
      borderRadius: {
        'card': 'var(--card-radius)',
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
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
      },
    },
  },
  plugins: [],
}
