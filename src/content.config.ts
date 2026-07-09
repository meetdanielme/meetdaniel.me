import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const shared = {
  title: z.string(),
  description: z.string().optional().default(""),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),

  tags: z
    .array(z.string())
    .nullable()
    .optional()
    .default([])
    .transform((tags) => tags ?? []),
  draft: z.boolean().optional().default(false),
  heroImage: z.string().optional(),
  order: z.number().optional().default(999),
  location: z.string().optional(),
  period: z.string().optional(),
  teamSize: z.string().optional(),
  metrics: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      }),
    )
    .optional()
    .default([]),
};

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object(shared),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object(shared),
});

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/case-studies" }),
  schema: z.object(shared),
});

const urlOrRootRelativePath = z.string().refine(
  (value) => {
    if (value.startsWith("/")) return true;

    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  { message: "Expected a full URL or a root-relative path." },
);

const rightNow = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/right-now" }),
  schema: z.object({
    text: z.string().max(280),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    location: z.string().optional(),
    media: z
      .array(
        z.object({
          type: z.enum(["image", "video"]),
          src: urlOrRootRelativePath,
          alt: z.string().optional().default(""),
          width: z.number().optional(),
          height: z.number().optional(),
          mimeType: z.string().optional(),
          size: z.number().optional(),
        }),
      )
      .optional()
      .default([]),
    links: z
      .array(
        z.object({
          url: z.url(),
          title: z.string().optional(),
          description: z.string().optional(),
          image: z.url().optional(),
          siteName: z.string().optional(),
        }),
      )
      .optional()
      .default([]),
    syndication: z
      .object({
        mastodon: z.url().nullable().optional(),
        bluesky: z.url().nullable().optional(),
        threads: z.url().nullable().optional(),
        twitter: z.url().nullable().optional(),
      })
      .optional()
      .default({}),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = {
  blog,
  pages,
  "case-studies": caseStudies,
  "right-now": rightNow,
};
