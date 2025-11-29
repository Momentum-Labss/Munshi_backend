/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Tailwind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./contexts/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter_400Regular'],      // Default font
        inter: ['Inter_400Regular'],     // Explicit
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
      },
      colors: {
        brand: "#1a223d",
        primary: {
          DEFAULT: "#3B82F6",
          dark: "#2563EB",
        },
        secondary: {
          DEFAULT: "#8B5CF6",
          dark: "#7C3AED",
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",

        // Light mode colors
        light: {
          bg: {
            primary: "#FFFFFF",
            secondary: "#F8FAFC",
            tertiary: "#F1F5F9",
          },
          text: {
            primary: "#0F172A",
            secondary: "#475569",
            tertiary: "#94A3B8",
          },
          border: "#E2E8F0",
        },

        // Dark mode colors
        dark: {
          bg: {
            primary: "#0F172A",
            secondary: "#1E293B",
            tertiary: "#334155",
          },
          text: {
            primary: "#F8FAFC",
            secondary: "#CBD5E1",
            tertiary: "#64748B",
          },
          border: "#334155",
        },
      },
    },
  },
  plugins: [],
};