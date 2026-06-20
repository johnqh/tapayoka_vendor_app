/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Scoped to dist: @sudobility/components is a file: link to the whole
    // mail_box_components repo, so a bare ** would scan its node_modules too.
    "./node_modules/@sudobility/components/dist/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@sudobility/design/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@sudobility/building_blocks/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@sudobility/devops-components/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@sudobility/auth-components/**/*.{js,jsx,ts,tsx}",
    // Scoped to dist: a file: link exposes the whole entity_pages repo, so a
    // bare ** would scan its node_modules too. dist matches the published
    // package and the link alike.
    "./node_modules/@sudobility/entity_pages/dist/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        theme: {
          "bg-primary": "var(--color-bg-primary)",
          "bg-secondary": "var(--color-bg-secondary)",
          "bg-tertiary": "var(--color-bg-tertiary)",
          "text-primary": "var(--color-text-primary)",
          "text-secondary": "var(--color-text-secondary)",
          "text-tertiary": "var(--color-text-tertiary)",
          border: "var(--color-border)",
          "border-light": "var(--color-border-light)",
          "hover-bg": "var(--color-hover-bg)",
          "hover-border": "var(--color-hover-border)",
        },
      },
    },
  },
  plugins: [],
};
