import themes from "daisyui/src/theming/themes"
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
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
