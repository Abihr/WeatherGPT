/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Manrope", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        sky: {
          50: "#F3F9FF",
          100: "#E6F3FE",
          150: "#D9EDFD",
          200: "#C3E2FC",
          300: "#9BCCF8",
          400: "#6EAFEF",
          500: "#4A90D9",
          600: "#3874B8",
          700: "#2C5C93",
          800: "#22496F",
          900: "#1A3A57",
        },
        sun: {
          300: "#FFD08A",
          400: "#FFB65C",
          500: "#FF9F3D",
        },
        ink: {
          50: "#F7F9FC",
          100: "#EEF2F7",
          400: "#7C8AA0",
          500: "#5B6B82",
          700: "#33415A",
          800: "#22304A",
          900: "#152034",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(21, 32, 52, 0.04), 0 8px 24px -8px rgba(58, 108, 168, 0.16)",
        card: "0 1px 1px rgba(21, 32, 52, 0.03), 0 4px 14px -6px rgba(58, 108, 168, 0.14)",
        pop: "0 12px 32px -8px rgba(58, 108, 168, 0.28)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      backgroundImage: {
        "sky-wash": "linear-gradient(160deg, #EAF6FF 0%, #F7FBFF 55%, #FFFFFF 100%)",
        "hero-gradient": "linear-gradient(135deg, #5FA3E8 0%, #4A90D9 45%, #3E7FC9 100%)",
      },
    },
  },
  plugins: [],
};
