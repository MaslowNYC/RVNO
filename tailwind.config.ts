import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        rvno: {
          // Dark workshop theme - warm charcoal like a well-worn bench
          bg: "#1C1C1E",
          card: "#2A2A2E",
          elevated: "#323236",
          surface: "#3A3A3E",

          // Teal accent - used sparingly like a pinstripe
          teal: "#4AABB8",
          "teal-dark": "#3A9BA8",
          "teal-muted": "#3A8A96",

          // Copper/brass accent - like old motorcycle hardware
          copper: "#C4853A",
          "copper-dark": "#A66E2C",

          // Paper color for RoadTimeline background
          paper: "#2A2A2E",

          // Text - warm off-white like old paper
          ink: "#E8E4DC",
          "ink-muted": "#A8A49C",
          "ink-dim": "#6B6760",

          // Road visualization
          road: "#4A4A4E",
          "road-dark": "#3A3A3E",
          "road-edge": "#2A2A2E",
          "road-line": "#6B6760",

          // Dots/markers in copper - like brass rivets
          dot: "#C4853A",
          "dot-hover": "#D4954A",

          // White for button text
          white: "#FFFFFF",

          // Subtle border
          border: "rgba(255,255,255,0.08)",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body: ["Atkinson Hyperlegible", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      fontSize: {
        xs: ["0.875rem", { lineHeight: "1.5" }],   // 14px
        sm: ["0.9375rem", { lineHeight: "1.6" }],  // 15px
        base: ["1rem", { lineHeight: "1.7" }],     // 16px
        lg: ["1.125rem", { lineHeight: "1.6" }],   // 18px
        xl: ["1.25rem", { lineHeight: "1.5" }],    // 20px
        "2xl": ["1.5rem", { lineHeight: "1.4" }],  // 24px
        "3xl": ["2rem", { lineHeight: "1.3" }],    // 32px
      },
    },
  },
  plugins: [],
};

export default config;
