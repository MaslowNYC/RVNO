import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        rvno: {
          bg: "#1A1A1F",
          card: "#222228",
          elevated: "#2A2A32",
          surface: "#32323C",
          teal: "#4AABB8",
          "teal-dark": "#2D8A96",
          "teal-muted": "#3A7A84",
          paper: "#2C2A26",
          "paper-light": "#3A3730",
          ink: "#F5F2EB",
          "ink-muted": "#B8B3A8",
          "ink-dim": "#8A857A",
          road: "#5C5040",
          "road-dark": "#4A3F32",
          "road-edge": "#3A3228",
          "road-line": "#8A7D65",
          dot: "#D4582A",
          "dot-hover": "#E8703E",
          white: "#FAF8F4",
          border: "rgba(255,255,255,0.06)",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body: ["Atkinson Hyperlegible", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
