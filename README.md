# meetdaniel.me

Personal website of Daniel Marcinkowski — a static, Markdown-first site for writing, work, case studies, and personal pages.

## Stack

- [Astro](https://astro.build/)
- TypeScript
- TailwindCSS
- Astro content collections powered by Markdown
- Vercel hosting and Speed Insights

## What is included

- Blog posts with tags, RSS, and sitemap support
- Work page and dedicated case study pages
- About, Now, Uses, and Privacy Policy pages
- Static client-side search
- Light/dark theme support

## Content authoring notes

Most content lives in Markdown files under `src/content`. Blog posts are in `src/content/blog`, static pages are in `src/content/pages`, and case studies are in `src/content/case-studies`.

### Frontmatter

Use frontmatter for page metadata and images:

```yaml
---
title: "Page title"
description: "Short summary used for previews and metadata."
pubDate: 2026-05-06
updatedDate: 2026-05-06
heroImage: "/images/example/example.png"
tags:
  - "Tech"
draft: false
---
```

Case studies also support:

```yaml
order: 1
location: "Berlin, Germany"
period: "January 2021 – November 2024"
teamSize: "From 20 to 70 people"
metrics:
  - label: "Customer growth"
    value: "25 to 20,000+"
```

### Buttons

Buttons can be written directly in Markdown with HTML. Use `btn-primary` for the main action and `btn-secondary` for supporting actions.

```html
<p>
  <a class="btn btn-primary" href="mailto:hey@meetdaniel.me">
    <i class="ri-mail-line" aria-hidden="true"></i>Contact Me
  </a>
  <a class="btn btn-secondary" href="/files/daniel_marcinkowski_cv_2026.pdf">
    <i class="ri-download-line" aria-hidden="true"></i>Download CV
  </a>
</p>
```

Icons use [Remix Icon](https://remixicon.com/) classes.

### Figures and captions

Use `<figure>` when an image needs a caption. Images inside article content automatically support click-to-expand unless they are wrapped in a link.

```html
<figure>
  <img src="/images/example/screenshot.png" alt="Screenshot of the interface">
  <figcaption>Screenshot caption.</figcaption>
</figure>
```

### Side-by-side images

Use image grids for related screenshots. They display side-by-side on larger screens and stack on mobile.

```html
<div class="image-grid image-grid-2">
  <figure>
    <img src="/images/example/one.png" alt="First screenshot">
    <figcaption>First state</figcaption>
  </figure>
  <figure>
    <img src="/images/example/two.png" alt="Second screenshot">
    <figcaption>Second state</figcaption>
  </figure>
</div>
```

For three images, use `image-grid-3`.

### Images and files

Keep site assets local instead of hotlinking remote WordPress media. Public files are served from the site root:

- `public/images/case-studies/example/image.png` becomes `/images/case-studies/example/image.png`
- `public/files/example.pdf` becomes `/files/example.pdf`

If a post or case study has no `heroImage`, preview cards fall back to the first local Markdown image where possible.

## Local development

```sh
pnpm install
pnpm run dev
pnpm run build
```
