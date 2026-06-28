import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Backgrounds ---
        background:         "var(--background)",
        surface:            "var(--surface)",
        "surface-elevated": "var(--surface-elevated)",
        "surface-hover":    "var(--surface-hover)",

        // --- Borders ---
        border:             "var(--border)",
        "border-subtle":    "var(--border-subtle)",
        "border-strong":    "var(--border-strong)",

        // --- Brand Primary (Indigo) ---
        primary: {
          DEFAULT:          "var(--primary)",
          hover:            "var(--primary-hover)",
          muted:            "var(--primary-muted)",
          foreground:       "var(--primary-foreground)",
        },

        // --- Brand Secondary (Cyan) ---
        secondary: {
          DEFAULT:          "var(--secondary)",
          hover:            "var(--secondary-hover)",
          muted:            "var(--secondary-muted)",
        },

        // --- Text ---
        foreground:         "var(--foreground)",
        muted:              "var(--foreground-muted)",
        subtle:             "var(--foreground-subtle)",
        disabled:           "var(--foreground-disabled)",

        // --- Semantic ---
        success:            "var(--success)",
        "success-muted":    "var(--success-muted)",
        warning:            "var(--warning)",
        "warning-muted":    "var(--warning-muted)",
        destructive:        "var(--destructive)",
        "destructive-muted":"var(--destructive-muted)",

        // --- Shadcn compatibility ---
        card: {
          DEFAULT:          "var(--surface)",
          foreground:       "var(--foreground)",
        },
        popover: {
          DEFAULT:          "var(--surface-elevated)",
          foreground:       "var(--foreground)",
        },
        accent: {
          DEFAULT:          "var(--primary-muted)",
          foreground:       "var(--primary)",
        },
        input:              "var(--border)",
        ring:               "var(--primary)",
      },

      borderRadius: {
        xs:                 "var(--radius-xs)",
        sm:                 "var(--radius-sm)",
        DEFAULT:            "var(--radius)",
        lg:                 "var(--radius-lg)",
        xl:                 "var(--radius-xl)",
        "2xl":              "var(--radius-2xl)",
        full:               "var(--radius-full)",
      },

      boxShadow: {
        sm:                 "var(--shadow-sm)",
        DEFAULT:            "var(--shadow)",
        lg:                 "var(--shadow-lg)",
        glow:               "var(--shadow-glow)",
        "glow-cyan":        "var(--shadow-glow-cyan)",
      },

      backgroundImage: {
        "gradient-hero":    "var(--gradient-hero)",
        "gradient-accent":  "var(--gradient-accent)",
        "gradient-surface": "var(--gradient-surface)",
        "gradient-glow":    "var(--gradient-glow)",
      },

      fontFamily: {
        sans:               ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono:               ["var(--font-mono)", "ui-monospace", "monospace"],
      },

      transitionDuration: {
        fast:               "var(--transition-fast)",
        DEFAULT:            "var(--transition)",
        slow:               "var(--transition-slow)",
      },

      animation: {
        "fade-up":          "fade-up 0.6s ease forwards",
        "fade-in":          "fade-in 0.4s ease forwards",
        "pulse-glow":       "pulse-glow 3s ease-in-out infinite",
        float:              "float 6s ease-in-out infinite",
        shimmer:            "shimmer 3s linear infinite",
      },

      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99, 102, 241, 0.2)" },
          "50%":       { boxShadow: "0 0 40px rgba(99, 102, 241, 0.4)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% center" },
          to:   { backgroundPosition: "200% center" },
        },
      },
    },
  },
  plugins: [],
};

export default config;