# AGENTS.md

## Project Overview

This repository contains `meetdaniel.me`, Daniel Marcinkowski's personal website. It is a static, Markdown-first Astro site for blog posts, personal pages, and work case studies.

Core stack:

- Astro 5 with TypeScript
- Astro content collections in `src/content`
- Tailwind CSS 3 plus custom global CSS in `src/styles/global.css`
- Vercel hosting, analytics, and speed insights
- `pnpm` as the package manager

## Important Commands

Run commands from the repository root.

```sh
pnpm install
pnpm run dev
pnpm run build
pnpm run preview
```

Use `pnpm run build` as the main verification command before considering code or content changes complete. `npm run build` also works because the scripts are package-manager agnostic, but prefer `pnpm` for consistency with the repo. The build validates Astro routes, content collection schemas, Markdown rendering, RSS, sitemap generation, and asset references that are checked during rendering.

There is no configured test, lint, or format script in `package.json` at the moment.

For image optimization, the project has used Optimizt via `npx @funboxteam/optimizt ...`. Preserve the higher-resolution/original visual asset when removing duplicates; only delete byte-identical duplicates or clearly unused lower-value copies.

## Repository Structure

- `src/pages/` contains Astro routes and endpoint routes.
- `src/layouts/Base.astro` owns the shared page shell, navigation, SEO metadata, theme script, analytics, and footer.
- `src/components/` contains reusable UI pieces such as search and buttons.
- `src/scripts/` contains small bundled client scripts loaded from layouts, currently including site search.
- `src/content/blog/` contains blog post Markdown.
- `src/content/pages/` contains static page Markdown such as About, Now, Uses, Work, and policies.
- `src/content/case-studies/` contains work case study Markdown.
- `src/content/config.ts` defines the frontmatter schema shared by all content collections.
- `src/utils/` contains Markdown/HTML transforms, image helpers, and embed helpers.
- `src/styles/global.css` contains the main site styling layered on top of Tailwind.
- `public/` contains static assets served from the site root.
- `posts/` and `pages/` are older source/export folders from migration work. Do not treat them as the live content source unless the task specifically asks for migration or archival work.

## Content Rules

Live content belongs under `src/content`, not the legacy root-level `posts/` or `pages/` folders.

Required frontmatter for blog posts, pages, and case studies is controlled by `src/content/config.ts`:

```yaml
---
title: "Title"
description: "Short metadata summary."
pubDate: 2026-05-06
updatedDate: 2026-05-06
tags:
  - "Tag"
draft: false
heroImage: "/images/example/image.jpg"
---
```

Notes:

- `pubDate` is required for every content entry.
- `description` is optional in the schema but should usually be present for published public pages.
- `draft: true` excludes content from public listing pages, detail routes, RSS, and search.
- Use `updatedDate` for meaningful changes to already published content. Do not change `pubDate` unless the piece is intentionally being republished.
- Filenames define public URLs. Rename Markdown files only when the URL change is intended and redirects have been considered.
- Blog URLs are `/blog/{slug}/`.
- Static page URLs are `/{slug}/`.
- Case study URLs are `/work/{slug}/`.
- Case study ordering on `/work/` is controlled by the `order` frontmatter field, then by publication date.
- Static pages `/about/`, `/work/`, `/uses/`, and `/now/` should show `updatedDate` under the title. Do not add this display to policy pages unless asked.

Case studies may also use:

```yaml
order: 1
location: "Berlin, Germany"
period: "January 2021 - November 2024"
teamSize: "From 20 to 70 people"
metrics:
  - label: "Customer growth"
    value: "25 to 20,000+"
```

Do not invent metrics or metadata just to fill the layout.

Draft examples:

```yaml
---
title: "Draft title"
description: "Short draft summary."
pubDate: 2026-05-11
updatedDate: 2026-05-11
tags:
  - "Draft"
draft: true
heroImage: "/images/posts/2026/example.jpg"
---
```

To add content:

- New article: add a Markdown file to `src/content/blog/`; filename becomes `/blog/{slug}/`.
- New static page: add a Markdown file to `src/content/pages/`; filename becomes `/{slug}/`.
- New case study: add a Markdown file to `src/content/case-studies/`; filename becomes `/work/{slug}/`.
- Updating existing content: edit the existing Markdown file, update `updatedDate` for meaningful changes, and avoid changing the filename unless the public URL should change.
- Publishing a draft: set `draft: false`, confirm frontmatter is complete, and run `pnpm run build`.

## Assets And Images

Keep site assets local in `public/`; avoid hotlinking remote media.

Use root-relative paths in Markdown and frontmatter:

```md
![Descriptive alt text](/images/posts/2026/example.jpg)
```

Recommended locations:

- Blog images: `public/images/posts/YYYY/`
- Static page images: `public/images/pages/page-name/`
- Case study images: `public/images/case-studies/project-slug/`
- Profile or shared images: `public/images/profile/` or another clear shared folder.
- Downloadable files such as CV PDFs: `public/files/`

Guidelines:

- Use descriptive lowercase filenames without spaces.
- Include useful alt text for meaningful images.
- `heroImage` takes priority over the first Markdown image for listing cards and social images.
- If no page/post/case-study featured image is available, the default social sharing image comes from `Base.astro`: `/images/pages/2025/DSC_5324A-by-Karen-Harms-1-1024x683.jpeg`.
- The image metadata helpers read local files under `public/` to set dimensions for common image formats.
- Template images should include `width`, `height`, `decoding="async"`, and suitable `loading`/`fetchpriority`.
- Hero images that are likely above the fold use `loading="eager"` and `fetchpriority="high"`.
- Listing/card thumbnails should stay `loading="lazy"` and `decoding="async"`.
- The sidebar profile image is eager but low priority so it does not compete with content hero images.
- Markdown image attributes and dimensions are added by local remark/rehype plugins when the image is local under `public/`.
- After adding or moving assets, run `pnpm run build` and check the affected page/listing path in development or preview when visual output matters.
- After importing many images, optimize them and scan for exact duplicates. Keep the higher-resolution/canonical image when choosing between similar files.

Side-by-side images can be authored directly in Markdown with existing global styles:

```html
<div class="image-grid image-grid-2">
  <figure>
    <img src="/images/example/one.png" alt="First example">
    <figcaption>First example</figcaption>
  </figure>
  <figure>
    <img src="/images/example/two.png" alt="Second example">
    <figcaption>Second example</figcaption>
  </figure>
</div>
```

Use `image-grid-3` for three columns. These grids stack on small mobile screens. Captions belong in `figcaption` and should describe what the reader is seeing, not repeat the filename.

## Markdown And Embeds

Astro Markdown is extended by custom plugins in `src/utils/`:

- YouTube URLs on their own line are converted into lightweight embeds.
- Some WordPress-style YouTube embed wrappers are converted during build.
- iCloud Keynote links are converted into presentation cards.
- Markdown image attributes and image metadata are handled by local remark/rehype utilities.
- `lite-youtube-embed` CSS/JS should not be loaded globally. Pass `hasYouTubeEmbeds` into `Base.astro` only for routes whose content contains a real standalone YouTube embed.
- Ordinary inline links to YouTube should remain links and should not trigger embed assets.

Buttons can be written in Markdown with existing classes:

```html
<a class="btn btn-primary" href="mailto:hey@meetdaniel.me">
  <i class="ri-mail-line" aria-hidden="true"></i>Contact Me
</a>
```

Icons use Remix Icon classes, already imported in `Base.astro`.

Avoid underlines and unreadable colour combinations in buttons. Button links should keep `text-decoration: none` in normal, hover, focus, and active states.

## Styling And UI Conventions

Preserve the current restrained personal-site aesthetic:

- Figtree for body text and JetBrains Mono for code.
- Light/dark themes driven by CSS variables and `html[data-theme]`.
- Brand gold is the primary accent.
- Buttons, icons, cards, figures, and prose styles are mostly defined in `src/styles/global.css`.
- Tailwind utility classes are used directly in Astro templates for layout and spacing.

When changing UI:

- Reuse existing classes before adding new styling.
- Keep new components compatible with light and dark themes.
- Keep navigation and route labels consistent with `Base.astro`.
- Avoid broad visual rewrites unless the task explicitly asks for them.
- The OS-triggered and manually triggered dark themes should use the same near-black palette. Do not introduce a separate grey automatic dark mode.
- The theme toggle uses `localStorage` key `theme-preference`. Avoid writing automatic system choices as manual preferences.
- User-facing social labels should say `Twitter`, not `X`; the URL may remain `https://x.com/meetdanielme`.
- The site name/logo links to the homepage.

## Code Conventions

- Prefer TypeScript for new source files under `src/`.
- Keep Astro page logic close to the route when it is route-specific.
- Put reusable content, image, Markdown, or search helpers in `src/utils/`.
- Keep client-side JavaScript small and progressive; this site should remain static and fast.
- Follow the existing mixture of Astro templates, Tailwind utilities, and plain CSS rather than introducing a new UI framework.
- The project uses trailing slashes. Preserve route links in the same style, such as `/blog/example/`.
- Avoid duplicating inline scripts in components. `SearchBox.astro` is markup only; search behavior lives in `src/scripts/search.ts` and is loaded once from `Base.astro`.
- The image lightbox is deliberately lightweight and lives in `Base.astro`; do not replace it with a heavy gallery library unless explicitly asked.
- `@vercel/analytics/astro` and `@vercel/speed-insights/astro` are loaded in `Base.astro`.

## Search, RSS, And Sitemap

The search endpoint is `src/pages/search.json.ts`. It currently indexes non-draft blog posts and static pages.

RSS is generated by `src/pages/rss.xml.js` from non-draft blog posts.

Sitemap support comes from `@astrojs/sitemap`, with `src/pages/sitemap.xml.js` returning a sitemap index wrapper.

When adding new content collections or public route types, update search/RSS/sitemap behavior deliberately instead of assuming they are automatic everywhere.

Case studies currently have public routes and sitemap coverage through Astro routes, but they are not necessarily included in search or RSS unless explicitly added.

## Redirects And URL Stability

Vercel redirects live in `vercel.json`. Add redirects when removing or renaming published routes that may have existing links.

Preserve legacy WordPress compatibility redirects already added for feeds and paginated archives, such as `/feed/` to `/rss.xml` and `/page/:page/` to `/blog/`.

Be especially careful with:

- Blog post filenames
- Static page filenames
- Case study filenames
- Tag slug generation, which lowercases tags and replaces spaces with hyphens

Generated/cache/dependency folders should stay out of Git:

- `dist/`
- `.astro/`
- `node_modules/`
- `.vercel/`
- `.DS_Store`

If these paths appear dirty after a build, check whether they are ignored or historically tracked before committing.

## Migration Scripts

`migrate.py` and `scripts-import-seo.py` are migration helpers. They are not part of the normal development workflow.

Do not run or modify them for ordinary content edits unless the task is specifically about migration, old WordPress content, or SEO import work.

## Completion Checklist

Before finishing a change:

1. Confirm edited content uses valid frontmatter.
2. Confirm any asset paths are root-relative and point into `public/`.
3. Run `pnpm run build` for code, route, schema, content, or asset changes.
4. For visual changes, run the dev server or preview and inspect the affected page.
5. Check `git status` before committing so generated files are not included.
6. Mention any verification command that could not be run.
