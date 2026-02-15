
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#ffffff",
        secondary: "#f9fafb",
        border: "#e5e7eb",
        text: "#101828",
        muted: "#4a5565",
        accent: "#155dfc",
        "accent-hover": "#1447e6",
        success: "#12b981",
        "success-bg": "#ecfdf3",
        danger: "#ef4444",
        "danger-bg": "#fef2f2",
      },
    },
  },
  plugins: [],
};