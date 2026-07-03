import { getCollection } from "astro:content";
import { getEntrySlug } from "../utils/content";

export async function GET() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const pages = await getCollection("pages", ({ data }) => !data.draft);
  const items = [
    ...posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      tags: post.data.tags,
      url: `/blog/${getEntrySlug(post)}/`,
      type: "Post",
    })),
    ...pages.map((page) => ({
      title: page.data.title,
      description: page.data.description,
      tags: page.data.tags,
      url: `/${getEntrySlug(page)}/`,
      type: "Page",
    })),
  ];
  return new Response(JSON.stringify(items), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
