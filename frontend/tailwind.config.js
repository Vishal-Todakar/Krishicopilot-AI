/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#00450d",
        "primary-container": "#1b5e20",
        "on-primary": "#ffffff",
        "on-primary-container": "#90d689",
        "primary-fixed": "#acf4a4",
        "primary-fixed-dim": "#91d78a",
        
        "secondary": "#3f6a00",
        "secondary-container": "#aef35e",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#426e00",
        "secondary-fixed": "#b1f661",
        "secondary-fixed-dim": "#96d947",
        
        "tertiary": "#5c2f00",
        "tertiary-container": "#7e4200",
        "on-tertiary": "#ffffff",
        "tertiary-fixed": "#ffdcc3",
        "on-tertiary-fixed": "#2f1500",
        
        "surface": "#f1fcf3",
        "surface-bright": "#f1fcf3",
        "surface-dim": "#d1ddd4",
        "surface-container": "#e5f1e7",
        "surface-container-low": "#ebf7ed",
        "surface-container-high": "#e0ebe2",
        "surface-container-highest": "#dae5dc",
        "surface-container-lowest": "#ffffff",
        
        "on-surface": "#141e18",
        "on-surface-variant": "#41493e",
        "outline": "#717a6d",
        "outline-variant": "#c0c9bb",
        
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
      },
      fontFamily: {
        headline: ["Space Grotesk", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}
