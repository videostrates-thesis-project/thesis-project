import themes from "daisyui/src/theming/themes"
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "bounce-big": {
          "0%, 100%": {
            transform: "translateY(-75%)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
        shrink: {
          "0%": {
            fontSize: "1.7rem",
          },
          "100%": {
            fontSize: "1.2rem",
          },
        },
      },
      animation: {
        "bounce-big": "bounce-big 1s linear infinite",
        shrink: "shrink 0.5s ease-in-out forwards",
      },
    },
  },
  plugins: [require("daisyui"), require("tailwind-scrollbar")],
  daisyui: {
    themes: [
      {
        light: {
          ...themes["dark"],
          accent: "#00F0C5",
        },
      },
    ],
  },
}
