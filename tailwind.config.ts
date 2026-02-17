import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        rvno: {
          // Light theme - warm cream/parchment background
          bg: "#F5F0E8",
          card: "#FFFDF8",
          elevated: "#FFFFFF",
          surface: "#EDE8E0",

          // Teal accents - darkened for WCAG AA contrast on light bg
          teal: "#1D7A86",
          "teal-dark": "#155A63",
          "teal-muted": "#2A8B98",

          // Paper/road colors for RoadTimeline
          paper: "#F5F0E8",
          "paper-light": "#FAF7F2",

          // Text colors - dark on light
          ink: "#1A1A1F",
          "ink-muted": "#4A4843",
          "ink-dim": "#6B6760",

          // Road visualization colors
          road: "#8B7355",
          "road-dark": "#6B5A45",
          "road-edge": "#5A4A38",
          "road-line": "#D4C9B8",

          // Accent colors
          dot: "#C44D22",
          "dot-hover": "#A83D18",

          // White (for dark backgrounds like buttons)
          white: "#FFFFFF",

          // Border color for light theme
          border: "rgba(0,0,0,0.12)",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body: ["Atkinson Hyperlegible", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      fontSize: {
        // Enforce minimum sizes
        xs: ["0.875rem", { lineHeight: "1.5" }],  // 14px min
        sm: ["1rem", { lineHeight: "1.6" }],       // 16px
        base: ["1.125rem", { lineHeight: "1.6" }], // 18px
        lg: ["1.25rem", { lineHeight: "1.5" }],
        xl: ["1.5rem", { lineHeight: "1.4" }],
        "2xl": ["1.875rem", { lineHeight: "1.3" }],
        "3xl": ["2.25rem", { lineHeight: "1.2" }],
      },
    },
  },
  plugins: [],
};

export default config;
