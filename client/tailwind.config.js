import forms from '@tailwindcss/forms'
import containerQueries from '@tailwindcss/container-queries'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-secondary-fixed-variant": "#424846",
        "error-container": "#ffdad6",
        "tertiary": "#33245a",
        "tertiary-fixed-dim": "#cfbdfe",
        "surface-container-lowest": "#ffffff",
        "surface-tint": "#476558",
        "primary-container": "#2d4a3e",
        "primary": "#163328",
        "inverse-surface": "#30312e",
        "secondary-fixed-dim": "#c2c8c5",
        "on-error": "#ffffff",
        "error": "#ba1a1a",
        "on-surface": "#1b1c19",
        "surface-dim": "#dbdad5",
        "on-primary": "#ffffff",
        "on-secondary": "#ffffff",
        "inverse-primary": "#adcebe",
        "on-background": "#1b1c19",
        "tertiary-fixed": "#e9ddff",
        "on-tertiary": "#ffffff",
        "outline-variant": "#c1c8c3",
        "surface-container": "#f0eee9",
        "on-primary-container": "#99b9a9",
        "on-secondary-fixed": "#171d1b",
        "on-tertiary-container": "#baa8e8",
        "inverse-on-surface": "#f2f1ec",
        "tertiary-container": "#4a3b72",
        "secondary-container": "#dce1de",
        "surface-container-highest": "#e4e2dd",
        "surface-bright": "#fbf9f4",
        "surface": "#fbf9f4",
        "primary-fixed-dim": "#adcebe",
        "on-tertiary-fixed": "#201047",
        "outline": "#727974",
        "on-tertiary-fixed-variant": "#4d3d75",
        "surface-container-high": "#eae8e3",
        "on-secondary-container": "#5e6462",
        "surface-container-low": "#f5f3ee",
        "on-primary-fixed-variant": "#304d40",
        "background": "#fbf9f4",
        "secondary": "#5a605d",
        "surface-variant": "#e4e2dd",
        "on-surface-variant": "#424844",
        "on-error-container": "#93000a",
        "primary-fixed": "#c9ead9",
        "secondary-fixed": "#dfe4e1",
        "on-primary-fixed": "#022016"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1.25rem",
        full: "9999px"
      },
      fontFamily: {
        headline: ["Newsreader", "serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [
    forms,
    containerQueries
  ],
}
