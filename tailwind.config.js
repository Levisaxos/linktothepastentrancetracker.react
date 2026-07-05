// Zelda Tracker Tailwind config.
//
// Color families are remapped to the shared house style. Each key color points at
// a CSS variable from the shared stylesheet (http://localhost:3005/housestyle.css,
// linked in public/index.html) with an AP-palette hex FALLBACK — so:
//   * with the SharedAssets site up, editing housestyle.css updates these live (no rebuild), and
//   * with it down, the fallback hex keeps everything looking correct.
// `purple` is intentionally left as Tailwind's default so the "Inverted" badge stays distinct.
const v = (name, fallback) => `var(${name}, ${fallback})`;

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gray: {
          50:  '#f5f5f5',
          100: v('--hs-text', '#f1f1f1'),
          200: '#dcdcdc',
          300: '#c8c8c8',
          400: v('--hs-text-dim', '#b4b4b4'),
          500: v('--hs-text-faint', '#808080'),
          600: v('--hs-border-hover', '#55555d'),
          700: v('--hs-border', '#3f3f46'),
          800: v('--hs-bg-1', '#2d2d30'),
          900: v('--hs-bg-0', '#1e1e1e'),
          950: '#151517',
        },
        blue: {
          50: '#e6f2fb', 100: '#cce5f7', 200: '#99caef', 300: '#5aa9e0',
          400: v('--hs-accent', '#2f97da'),
          500: '#0f86d2',
          600: v('--hs-accent-strong', '#007acc'),
          700: '#0a6cb4', 800: '#085a96', 900: '#0a3050', 950: '#071f34',
        },
        green: {
          50: '#eaf5e7', 100: '#d3ebcd', 200: '#a9d79f', 300: '#8fdc7e', 400: '#7bce68', 500: '#63b455',
          600: v('--hs-ok', '#57a64a'),
          700: '#4a8f3f', 800: '#3c7433', 900: '#1e3a17', 950: '#0f2410',
        },
        red: {
          50: '#fbeaec', 100: '#f7d5d9', 200: '#efabb2', 300: '#eb9aa1', 400: '#e57883', 500: '#dd505e',
          600: v('--hs-danger', '#d73a49'),
          700: '#b52e3b', 800: '#951f29', 900: '#3a1417', 950: '#25090c',
        },
        yellow: {
          50: '#fbf4e1', 100: '#f7e9c2', 200: '#efd485', 300: '#ecca6e', 400: '#e8c25a', 500: '#e5b94b',
          600: v('--hs-warn', '#e3b341'),
          700: '#c99a2e', 800: '#a67e24', 900: '#6b5115', 950: '#40300c',
        },
        amber: {
          50: '#fbf4e1', 100: '#f8ecc5', 200: '#f0d488', 300: '#ecca6e', 400: '#e8bf50', 500: '#e3b341',
          600: '#d9a52f', 700: '#b5851f', 800: '#5c4715', 900: '#3a2e10', 950: '#241c0a',
        },
      },
    },
  },
  plugins: [],
}
