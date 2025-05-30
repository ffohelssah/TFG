/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{html,ts}",
    ],
    darkMode: 'class',
    theme: {
      extend: {},
    },
    plugins: [],
    // Configuración específica para Tailwind v4 sin lightningcss
    future: {
      hoverOnlyWhenSupported: true,
    },
    experimental: {
      optimizeUniversalDefaults: true,
    },
    // Forzar el uso del motor CSS clásico de PostCSS
    corePlugins: {
      preflight: true,
    },
  };