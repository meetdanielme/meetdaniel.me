---
version: alpha
name: Daniel Marcinkowski
description: Visual identity for Daniel Marcinkowski's personal website (meetdaniel.me) and overall personal brand identity based on Figma brand tokens and current production behavior of meetdaniel.me.
colors:
  base: "#FFFFFF"
  contrast: "#000000"
  primary: "#EAAA00"
  secondary: "#B86E00"
  accent-blue: "#0066E9"
  tertiary: "#F6F6F6"
  subtle-surface: "#EFEFEF"
  base-dark: "#000000"
  contrast-dark: "#FFFFFF"
  muted-hover-dark: "#CCCCCC"
  code-dark-surface: "#2E2E2E"
typography:
  h1:
    fontFamily: Figtree
    fontSize: 2.5rem
    fontWeight: 700
    lineHeight: 1.2em
    letterSpacing: 0em
  h2:
    fontFamily: Figtree
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 1.2em
    letterSpacing: 0em
  h3:
    fontFamily: Figtree
    fontSize: 1.5625rem
    fontWeight: 700
    lineHeight: 1.2em
    letterSpacing: 0em
  h4:
    fontFamily: Figtree
    fontSize: 1.25rem
    fontWeight: 700
    lineHeight: 1.2em
    letterSpacing: 0em
  body-md:
    fontFamily: Figtree
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.2em
    letterSpacing: 0.01em
  body-reading:
    fontFamily: Figtree
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6em
    letterSpacing: 0.02em
  body-bold:
    fontFamily: Figtree
    fontSize: 1rem
    fontWeight: 700
    lineHeight: 1.2em
    letterSpacing: 0.01em
  caption-sm:
    fontFamily: Figtree
    fontSize: 0.875rem
    fontWeight: 700
    lineHeight: 1.2em
    letterSpacing: 0.01em
  code-sm:
    fontFamily: IBM Plex Mono
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.3em
    letterSpacing: 0em
rounded:
  none: 0px
  sm: 4px
  md: 8px
  pill: 9999px
spacing:
  xs: 0.44rem
  sm: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  section-gap: 1.5rem
  content-max: 650px
  wide-max: 1200px
components:
  body-text:
    textColor: "{colors.contrast}"
    typography: "{typography.body-reading}"
  link-default:
    textColor: "{colors.contrast}"
    typography: "{typography.body-reading}"
  link-hover:
    textColor: "{colors.primary}"
  link-external:
    textColor: "{colors.accent-blue}"
  link-active:
    textColor: "{colors.secondary}"
  site-title:
    textColor: "{colors.contrast}"
    typography: "{typography.caption-sm}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.contrast}"
    typography: "{typography.body-bold}"
    rounded: "{rounded.md}"
    padding: 0.67em
  button-primary-hover:
    backgroundColor: "{colors.contrast}"
    textColor: "{colors.contrast-dark}"
  button-primary-active:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.contrast}"
  button-outline:
    backgroundColor: "{colors.base}"
    textColor: "{colors.contrast}"
    rounded: "{rounded.md}"
  blockquote:
    backgroundColor: "{colors.base}"
    textColor: "{colors.contrast}"
    padding: "{spacing.md}"
  separator:
    backgroundColor: "{colors.tertiary}"
    height: 1px
  code-inline:
    backgroundColor: "{colors.subtle-surface}"
    textColor: "{colors.contrast}"
    typography: "{typography.code-sm}"
    rounded: "{rounded.sm}"
  code-block:
    backgroundColor: "{colors.subtle-surface}"
    textColor: "{colors.contrast}"
    typography: "{typography.code-sm}"
    rounded: "{rounded.md}"
  code-block-dark:
    backgroundColor: "{colors.code-dark-surface}"
    textColor: "{colors.contrast-dark}"
    typography: "{typography.code-sm}"
    rounded: "{rounded.md}"
  page-dark:
    backgroundColor: "{colors.base-dark}"
    textColor: "{colors.contrast-dark}"
  link-default-dark:
    textColor: "{colors.contrast-dark}"
  site-title-hover-dark:
    textColor: "{colors.muted-hover-dark}"
---

## Overview

The brand system is clean, editorial, and personal: a monochrome base with a strong warm-gold accent, plus restrained use of blue for external/social contexts. The voice should feel thoughtful and modern, with high readability and low visual noise.

This file is synced to the Figma brand file (`Personal brand`) and aligned with current production behavior on `meetdaniel.me`, including OS-driven dark mode.

## Colors

The color system is intentionally compact and semantic.

- **Base (`#FFFFFF`)**: Primary page background and card surfaces.
- **Contrast (`#000000`)**: Default text and icon color.
- **Primary (`#EAAA00`)**: Main interactive accent (buttons, emphasis).
- **Secondary (`#B86E00`)**: Active/pressed state for primary actions.
- **Accent Blue (`#0066E9`)**: External/social or utility accent.
- **Tertiary (`#F6F6F6`)**: Quiet separators and subtle structural surfaces.
- **Subtle Surface (`#EFEFEF`)**: Inline code and neutral UI fills.
- **Dark Mode Core (`#000000` / `#FFFFFF`)**: Inverted base/contrast pair for global dark mode.
- **Dark Mode Muted Hover (`#CCCCCC`)**: Gentle hover state in dark contexts.
- **Code Dark Surface (`#2E2E2E`)**: Dark mode code containers.

Dark mode is automatically triggered by OS preferences (`prefers-color-scheme: dark`) and inverts the page shell while keeping hierarchy and interaction semantics consistent.

## Typography

Typography comes directly from Figma text styles:

- **Primary family:** Figtree for headings, body, links, and captions.
- **Code family:** JetBrains Mono for monospaced contexts.
- **Headings:** Bold (700), clear editorial hierarchy (`H1` 40px down to `H4` 20px).
- **Body:** Base 16px with both compact (`body-md`) and reading (`body-reading`) line-height variants.

Use `body-reading` for long-form website copy and keep heading weights bold to preserve brand presence.

## Layout

Layout is constrained and content-first:

- Main reading width: **650** (content-max token).
- Wide layout width: **1200** (wide-max token).
- Global rhythm is built around **1.5rem** vertical spacing.
- Root page padding scales between medium and large spacing tokens.

Use a simple, consistent flow layout with clear section breaks and generous breathing room.

## Blog Hero Images

The blog archive contains a mix of photography, product shots, screenshots, composites, and illustrations. Older imported posts vary widely in format, including portrait screenshots and extra-wide banners. More recent hero images establish the direction to follow.

### Typical style

- **Editorial and personal:** Images should feel like part of an independent technology and lifestyle publication, not a generic corporate campaign.
- **Directly related to the article:** Feature the device, app, place, activity, or personal moment at the centre of the story.
- **One clear focal point:** Prefer a single dominant subject or a small, deliberately arranged group of objects.
- **Clean composition:** Use uncluttered surfaces, generous negative space, and simple backgrounds. Centred or balanced framing is common.
- **Restrained colour:** Neutral whites, blacks, greys, and warm natural tones dominate. Product or interface colours can provide the accent.
- **Natural texture and lighting:** Photography often uses daylight, warm indoor light, or subdued high-contrast light rather than glossy studio effects.
- **Technology in context:** Devices and software may appear as real desk scenes, close product photographs, clean interface compositions, or screenshots placed in simple mockups.
- **Human when relevant:** Personal essays can use candid portraits, documentary-style photographs, or simple hand-drawn illustration.
- **Minimal embedded text:** Do not add the article title to the image. Incidental interface or brand text is acceptable when it belongs to the photographed subject.

### Format and composition

- Create new blog hero images at **2000 × 1047 px** (**1.91:1**) where possible.
- Keep the main subject inside a generous central safe area. Blog listing thumbnails use a **16:10** crop and may remove content from the left and right edges.
- Avoid placing faces, device edges, logos, or essential interface details close to the frame boundary.
- The image should remain recognisable at small card size and still have enough detail for the full article view.
- Prefer a real photograph or purposeful editorial composition over a generic stock image.
- Older hero images are historical content, not strict visual references. Use the recent 2025–2026 images as the stronger style signal.

## Elevation & Depth

Depth is mostly flat. Hierarchy should come from:

1. Type scale and weight.
2. Spacing and grouping.
3. Subtle surface-tone shifts (`tertiary`, `subtle-surface`, `code-dark-surface`).

Avoid heavy shadows or neumorphic effects. Keep emphasis semantic and typographic.

## Shapes

The shape language is practical and soft-cornered where interactive:

- Primary and outline buttons use `rounded.md` (8px), matching Figma components.
- Inline code chips use a light rounding (`rounded.sm`).
- Larger code surfaces and cards use `rounded.md`.
- Social icon carriers may use pill/circle treatments where needed.

## Components

Component behavior should follow these patterns across light and dark modes:

- **Links (light):** contrast by default, primary gold on hover, dark-orange on active.
- **Links (external):** accent blue.
- **Buttons:** primary gold fill with black text, dark invert on hover/focus, dark-orange active state.
- **Dark mode shell:** page background black, text and icons white, muted hover to `#CCCCCC`.
- **Blockquotes:** neutral surface with a minimal left-edge treatment and generous horizontal padding.
- **Separators:** light tertiary rule; quiet divider, not a focal line.
- **Code (light):** subtle-surface background, black mono text.
- **Code (dark):** dark neutral background, white mono text.

## Do's and Don'ts

**Do**

- Keep contrast high and visual hierarchy simple.
- Use gold (`primary`) as the core interaction signal.
- Respect the OS-driven dark-mode inversion behavior.
- Preserve generous spacing and readable line-height for long-form text.
- Keep hover/focus states clear but understated.

**Don't**

- Replace brand gold with unrelated accents.
- Add heavy shadows, glossy effects, or decorative noise.
- Remove dark-mode contrast safeguards (white text on black shell).
- Use underlines by default; reserve them for clear interaction states.
