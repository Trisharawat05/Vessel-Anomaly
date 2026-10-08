/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
        border: "rgba(255, 255, 255, 0.08)",
        input: "rgba(255, 255, 255, 0.1)",
        ring: "#06b6d4",
        background: "#070b14", // Deep Navy background
        foreground: "#f1f5f9",
        card: {
          DEFAULT: "rgba(15, 23, 42, 0.65)",
          foreground: "#f8fafc",
        },
        popover: {
          DEFAULT: "#0f172a",
          foreground: "#f8fafc",
        },
        primary: {
          DEFAULT: "#06b6d4", // Cyan accent
          foreground: "#070b14",
        },
        secondary: {
          DEFAULT: "#1e293b",
          foreground: "#94a3b8",
        },
        muted: {
          DEFAULT: "#0f172a",
          foreground: "#64748b",
        },
        accent: {
          DEFAULT: "#14b8a6", // Teal accent
          foreground: "#070b14",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#f59e0b",
          foreground: "#070b14",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      keyframes: {
        "radar-sweep": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: 0.4 },
          "50%": { opacity: 0.9 },
        },
      },
      animation: {
        "radar-sweep": "radar-sweep 8s linear infinite",
        "pulse-subtle": "pulse-subtle 3s ease-in-out infinite",
      },
      backgroundImage: {
        'maritime-grid': 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 80%), linear-gradient(rgba(14, 165, 233, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.03) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
