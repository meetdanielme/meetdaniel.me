import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import remarkEmbeds from "./src/utils/remark-embeds.mjs";

export default defineConfig({
  site: "https://meetdaniel.me",
  trailingSlash: "always",
  markdown: {
    syntaxHighlight: "shiki",
    remarkPlugins: [remarkEmbeds],
    shikiConfig: {
      theme: "github-light",
      wrap: true,
    },
  },
  integrations: [tailwind(), sitemap()],
});
