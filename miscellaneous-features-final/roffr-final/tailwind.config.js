/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      marcellus: ["Marcellus", "sans-serif"],
      urbanist: ["Urbanist", "sans-serif"],
      outfit: ["Outfit", "sans-serif"],
      inter: ["Inter", "sans-serif"],
      intertight: ["Inter Tight", "sans-serif"],
      instument: ["Instrument Serif", "sans-serif"],
    },
    extend: {
      screens: {
        sm: "640px", // Small devices (landscape phones, 640px and up)
        md: "768px", // Medium devices (tablets, 768px and up)
        lg: "1024px", // Large devices (desktops, 1024px and up)
        xl: "1280px", // Extra large devices (large desktops, 1280px and up)
        "2xl": "1536px", // 2x Extra large devices (larger desktops, 1536px and up)
        // Custom breakpoints
        xs: "340px", // Extra small devices (phones, 480px and up)
        "3xl": "1700px",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".no-scrollbar::-webkit-scrollbar": {
          display: "none",
        },
        ".no-scrollbar": {
          "-ms-overflow-style": "none" /* IE and Edge */,
          "scrollbar-width": "none" /* Firefox */,
        },
      });
    },
  ],
}

