import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        /* FinTrack V2 design system — light editorial fintech palette */
        ink: {
          DEFAULT: "#0f1115",
          muted: "#6b7280",
          soft: "#3b4b2f",
        },
        surface: {
          DEFAULT: "#f7f7f8",
          green: "#eef8e4",
        },
        line: "#e7e7ea",
        brand: {
          DEFAULT: "#6bbf2f",
          ink: "#4a8a1f",
        },
        cta: {
          DEFAULT: "#111318",
          foreground: "#ffffff",
        },
        success: "#16a34a",
      },
      maxWidth: {
        landing: "1200px",
        "hero-copy": "420px",
        "feature-desc": "380px",
        "showcase-lead": "360px",
        "cta-heading": "360px",
      },
      boxShadow: {
        /* NB: must not reuse a colour token name — Tailwind also generates
           `shadow-<colour>` utilities and they would override this value. */
        elevated: "0 1px 2px rgba(16, 17, 20, 0.04), 0 8px 24px -12px rgba(16, 17, 20, 0.12)",
      },
      fontSize: {
        "body-lg": ["17px", { lineHeight: "1.6" }],
        body: ["15px", { lineHeight: "1.6" }],
        small: ["13px", { lineHeight: "1.6" }],
        "h-1": ["56px", { lineHeight: "1.05" }],
        "h-1-sm": ["40px", { lineHeight: "1.05" }],
        "h-1-snug": ["40px", { lineHeight: "1.1" }],
        "h-2": ["42px", { lineHeight: "1.1" }],
        "h-2-sm": ["32px", { lineHeight: "1.1" }],
        "h-3": ["19px", { lineHeight: "1.6" }],
        "h-4": ["26px", { lineHeight: "1.1" }],
      },
      letterSpacing: {
        display: "-0.02em",
        logo: "-0.01em",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
