import { defineCollection, z } from "astro:content";

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
};

const blog = defineCollection({ type: "content", schema: z.object(shared) });
const pages = defineCollection({ type: "content", schema: z.object(shared) });
const caseStudies = defineCollection({
  type: "content",
  schema: z.object(shared),
});

export const collections = { blog, pages, "case-studies": caseStudies };
