import typography from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      colors: {
        brand: {
          gold: '#EAAA00',
          orange: '#B86E00',
          blue: '#0066E9',
          surface: '#F6F6F6',
          code: '#EFEFEF',
        },
      },
    },
  },
  plugins: [typography],
};
