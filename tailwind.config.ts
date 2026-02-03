import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
        // shadcn/ui default colors
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

        // Custom cube theme colors
        "bg-primary": "rgb(var(--bg-primary))",
        "bg-secondary": "rgb(var(--bg-secondary))",
        "bg-card": "rgb(var(--bg-card))",
        "bg-elevated": "rgb(var(--bg-elevated))",

        "text-primary": "rgb(var(--text-primary))",
        "text-secondary": "rgb(var(--text-secondary))",
        "text-muted": "rgb(var(--text-muted))",

        "border-subtle": "rgb(var(--border-subtle))",
        "border-default": "rgb(var(--border-default))",
        "border-strong": "rgb(var(--border-strong))",

        // Cube colors
        "cube-white": "rgb(var(--cube-white))",
        "cube-yellow": "rgb(var(--cube-yellow))",
        "cube-red": "rgb(var(--cube-red))",
        "cube-orange": "rgb(var(--cube-orange))",
        "cube-blue": "rgb(var(--cube-blue))",
        "cube-green": "rgb(var(--cube-green))",

        // Accent colors
        "accent-primary": "rgb(var(--accent-primary))",
        "accent-secondary": "rgb(var(--accent-secondary))",
        "accent-success": "rgb(var(--accent-success))",
        "accent-warning": "rgb(var(--accent-warning))",
        "accent-danger": "rgb(var(--accent-danger))",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
