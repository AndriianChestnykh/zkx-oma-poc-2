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
        // Base colors
        background: "var(--background)",
        foreground: "var(--foreground)",

        // Surface colors
        surface: {
          DEFAULT: "var(--surface)",
          elevated: "var(--surface-elevated)",
          border: "var(--surface-border)",
        },

        // Primary colors
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          light: "var(--primary-light)",
          dark: "var(--primary-dark)",
        },

        // Accent colors
        accent: {
          purple: "var(--accent-purple)",
          'purple-light': "var(--accent-purple-light)",
          orange: "var(--accent-orange)",
          'orange-light': "var(--accent-orange-light)",
          green: "var(--accent-green)",
          'green-light': "var(--accent-green-light)",
          red: "var(--accent-red)",
          'red-light': "var(--accent-red-light)",
        },

        // Text colors
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          'on-primary': "var(--text-on-primary)",
        },

        // Border and divider
        border: {
          DEFAULT: "var(--border)",
          hover: "var(--border-hover)",
        },
        divider: "var(--divider)",

        // Status colors
        status: {
          success: "var(--status-success)",
          warning: "var(--status-warning)",
          error: "var(--status-error)",
          info: "var(--status-info)",
        },
      },
      boxShadow: {
        'glow-primary': '0 0 20px var(--glow-primary)',
        'glow-purple': '0 0 20px var(--glow-purple)',
        'glow-orange': '0 0 20px var(--glow-orange)',
        'glow-border-primary': '0 0 10px var(--glow-primary)',
        'glow-border-purple': '0 0 10px var(--glow-purple)',
      },
    },
  },
  plugins: [],
};

export default config;
