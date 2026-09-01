/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    safelist: [
        "after:animate-[shimmer_1.6s_linear_infinite]",
        "after:content-[' ']",
    ],
    plugins: [],
  }
