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
- Right Now micro-posts with a private owner-only posting page
- Work page and dedicated case study pages
- About, Now, Uses, and Privacy Policy pages
- Static client-side search
- Light/dark theme support

## Content authoring notes

Most content lives in Markdown files under `src/content`. Blog posts are in `src/content/blog`, static pages are in `src/content/pages`, case studies are in `src/content/case-studies`, and Right Now micro-posts are in `src/content/right-now`.

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

Set `draft: true` to keep a new or in-progress post, page, or case study out of the built site. Draft content is excluded from listing pages, detail routes, RSS, and search.

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

### Adding or updating content

Use one Markdown file per piece of content:

- Blog posts: `src/content/blog/my-article-slug.md` becomes `/blog/my-article-slug/`
- Static pages: `src/content/pages/about.md` becomes `/about/`
- Case studies: `src/content/case-studies/project-slug.md` becomes `/work/project-slug/`

To add a new article, copy the frontmatter shape above into a new file in `src/content/blog`, choose a stable lowercase filename with hyphens, write the post below the closing `---`, and set `draft: true` until it is ready to publish. When publishing, set `draft: false`, add the final `pubDate`, and run `pnpm run build`.

To add a new case study, create a Markdown file in `src/content/case-studies`, add `order` so the `/work/` listing appears in the intended order, and include any supported metadata such as `location`, `period`, `teamSize`, or `metrics` only when the content supports it. Do not invent metrics just to fill the layout.

To add a new static page, create a Markdown file in `src/content/pages`. If it should show a “Last updated” line, add `updatedDate` and update `src/pages/[slug].astro` only if the page slug is not already in the allowed list.

To add a Right Now post manually, create a Markdown file in `src/content/right-now`. Keep `text` at or below 280 characters, use an ISO timestamp for `createdAt`, optionally add `location` as `City, Country`, and store media URLs in the `media` array. The private `/right-now/new/` posting page normally creates these files by committing them back to the repository.

To update existing content, edit the existing Markdown file rather than changing its filename. Filenames define public URLs, so renaming a file changes the route and can break old links unless a redirect is added.

When updating published content, use `updatedDate` for meaningful revisions. Keep `pubDate` as the original publication date unless the piece is intentionally being republished.

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

### Embeds

YouTube links become lightweight embedded videos when the URL is placed on its own line in Markdown:

```md
https://www.youtube.com/watch?v=UylsydmgSI4
```

WordPress-style YouTube embed blocks are also converted automatically during the Astro build. iCloud Keynote links render as presentation cards, because Keynote does not provide the same kind of lightweight video embed.

```html
<div class="content-embed content-embed-card">
  <i class="ri-slideshow-line" aria-hidden="true"></i>
  <div>
    <p class="content-embed-label">Keynote slides</p>
    <a href="https://www.icloud.com/keynote/example">Open presentation</a>
  </div>
</div>
```

### Images and files

Keep site assets local instead of hotlinking remote WordPress media. Public files are served from the site root:

- `public/images/case-studies/example/image.png` becomes `/images/case-studies/example/image.png`
- `public/files/example.pdf` becomes `/files/example.pdf`

If a post or case study has no `heroImage`, preview cards fall back to the first local Markdown image where possible.

For new blog hero images, use **2000 × 1047 px** where possible. This gives a **1.91:1** aspect ratio suited to link and social previews. Keep important subjects and text away from the edges because listing cards may crop the image.

Recommended image locations:

- Blog images: `public/images/posts/YYYY/image-name.jpg`
- Static page images: `public/images/pages/page-name/image-name.jpg`
- Case study images: `public/images/case-studies/project-slug/image-name.jpg`
- Profile or global images: `public/images/profile/` or another clear shared folder

Use root-relative paths in frontmatter and Markdown:

```yaml
heroImage: "/images/case-studies/project-slug/cover.png"
```

```md
![Descriptive alt text](/images/posts/2026/example.jpg)
```

Use descriptive filenames, keep extensions lowercase, and avoid spaces in file names. Always include useful alt text unless the image is purely decorative. Prefer local images over remote URLs, especially for WordPress export media, so the site does not depend on the old WordPress uploads directory.

After adding or moving images, run `pnpm run build` and check the affected page, its preview card, and any tag or work listing that should display the image.

### Right Now posting environment

The public archive at `/right-now/` is static, but the private posting page at `/right-now/new/` uses server routes on Vercel.

Required environment variables:

- `RIGHT_NOW_POSTING_SECRET`: owner-only password for the posting page.
- `RIGHT_NOW_GITHUB_TOKEN`: fine-grained GitHub token with contents write access to this repository. `GITHUB_TOKEN` is also accepted as a fallback.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob read/write token for media uploads.

Optional environment variables:

- `RIGHT_NOW_GITHUB_REPO`: repository to commit posts into. Defaults to `meetdanielme/meetdaniel.me`.
- `RIGHT_NOW_GITHUB_BRANCH`: branch to commit posts into. Defaults to Vercel's deployment branch, then `main`.
- `RIGHT_NOW_LOCAL_PUBLISH`: set to `true` for local testing. Posts are written to `src/content/right-now`, and media files are written to `public/images/right-now/local`.

Optional Mastodon cross-posting variables:

- `MASTODON_INSTANCE_URL`: Mastodon instance URL, such as `https://mastodon.social`.
- `MASTODON_ACCESS_TOKEN`: Mastodon access token with `write:statuses`.

Optional Bluesky cross-posting variables:

- `BLUESKY_HANDLE`: Bluesky handle, such as `meetdaniel.me`.
- `BLUESKY_APP_PASSWORD`: Bluesky app password.
- `BLUESKY_SERVICE_URL`: Bluesky service URL. Defaults to `https://bsky.social`.

Cross-posting is enabled per platform when that platform's required variables are present. Leave a platform's variables unset to hide and disable that cross-posting button.

### Things to watch for

- `draft: true` hides content from the public build, but the Markdown still needs valid frontmatter.
- `pubDate` is required by the content schema for blog posts, pages, and case studies.
- `heroImage` takes priority over the first Markdown image for preview cards.
- Case study order is controlled by frontmatter, not filename order.
- Public URLs come from filenames, so rename content files carefully.
- Use root-relative asset paths like `/images/...`, not `public/images/...` inside Markdown.
- Run `pnpm run build` before publishing changes.

## Local development

```sh
pnpm install
pnpm run dev
pnpm run build
```
