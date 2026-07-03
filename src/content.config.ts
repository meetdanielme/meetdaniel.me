import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

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

export const collections = { blog, pages, "case-studies": caseStudies };
