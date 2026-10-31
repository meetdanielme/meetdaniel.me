import { unified } from "@astrojs/markdown-remark";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import remarkEmbeds from "./src/utils/remark-embeds.mjs";
import remarkImageAttributes from "./src/utils/remark-image-attributes.mjs";
import { RIGHT_NOW_ENABLED } from "./src/utils/site-features.ts";
import rehypeImages from "./src/utils/rehype-images.mjs";

export default defineConfig({
  site: "https://meetdaniel.me",
  adapter: vercel(),
  trailingSlash: "always",
  markdown: {
    syntaxHighlight: "shiki",
    processor: unified({
      remarkPlugins: [remarkEmbeds, remarkImageAttributes],
      rehypePlugins: [rehypeImages],
    }),
    shikiConfig: {
      theme: "github-light",
      wrap: true,
    },
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname;

        return (
          (RIGHT_NOW_ENABLED || !pathname.startsWith("/right-now/")) &&
          pathname !== "/right-now/new/" &&
          !/^\/right-now\/\d{4}-\d{2}-\d{2}-.*z\/$/.test(pathname)
        );
      },
    }),
  ],
});
