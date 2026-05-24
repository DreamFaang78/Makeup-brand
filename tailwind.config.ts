import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // LANAN Brand Palette
        obsidian: "#0A0A0A",
        gold: {
          DEFAULT: "#C9A96E",
          light: "#D4B88A",
          dark: "#A8813D",
          muted: "#E8D4B0",
        },
        taupe: {
          DEFAULT: "#9B7465",
          light: "#B8907E",
          dark: "#7A5A4C",
        },
        ivory: {
          DEFAULT: "#F7F1EA",
          dark: "#EDE4D8",
        },
        beige: {
          DEFAULT: "#E8D8CA",
          light: "#F2EAE1",
          dark: "#D4C0AE",
        },
        charcoal: "#2D2D2D",
        "success-green": "#2D7A4F",
        "error-red": "#C0392B",
        // Semantic
        brand: {
          primary: "#C9A96E",
          secondary: "#9B7465",
          bg: "#F7F1EA",
          dark: "#0A0A0A",
        },
      },
      fontFamily: {
        heading: ["Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        body: ["Inter", "Manrope", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        display: ["Cormorant Garamond", "serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
        "hero-xl": ["clamp(2.5rem, 6vw, 5rem)", { lineHeight: "1.1" }],
        "hero-lg": ["clamp(2rem, 4vw, 3.5rem)", { lineHeight: "1.15" }],
        "section": ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.2" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
        "section": "5rem",
        "section-lg": "8rem",
      },
      borderRadius: {
        "xl2": "18px",
        "xl3": "24px",
        "xl4": "28px",
        "card": "20px",
        "pill": "100px",
      },
      boxShadow: {
        "gold": "0 4px 30px rgba(201, 169, 110, 0.15)",
        "gold-lg": "0 8px 50px rgba(201, 169, 110, 0.25)",
        "card": "0 2px 20px rgba(10, 10, 10, 0.06)",
        "card-hover": "0 8px 40px rgba(10, 10, 10, 0.12)",
        "luxury": "0 20px 60px rgba(10, 10, 10, 0.08)",
        "luxury-lg": "0 30px 80px rgba(10, 10, 10, 0.12)",
        "glow-gold": "0 0 30px rgba(201, 169, 110, 0.3)",
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, #C9A96E 0%, #A8813D 50%, #C9A96E 100%)",
        "gradient-hero": "linear-gradient(160deg, #F7F1EA 0%, #E8D8CA 50%, #F7F1EA 100%)",
        "gradient-dark": "linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 100%)",
        "gradient-taupe": "linear-gradient(135deg, #9B7465 0%, #7A5A4C 100%)",
        "shimmer": "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-in-right": "slideInRight 0.4s ease forwards",
        "slide-in-left": "slideInLeft 0.4s ease forwards",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
        "ticker": "ticker 25s linear infinite",
        "spin-slow": "spin 8s linear infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(201, 169, 110, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(201, 169, 110, 0)" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "luxury": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
