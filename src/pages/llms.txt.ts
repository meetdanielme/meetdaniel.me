import { getCollection } from "astro:content";
import { getEntrySlug } from "../utils/content";

const siteUrl = "https://meetdaniel.me";

function absoluteUrl(path: string) {
  return new URL(path, siteUrl).href;
}

function formatDate(date?: Date) {
  return date?.toISOString().slice(0, 10);
}

function listItem(title: string, path: string, description?: string, updatedDate?: Date) {
  const metadata = [description, updatedDate ? `Updated: ${formatDate(updatedDate)}` : undefined]
    .filter(Boolean)
    .join(" — ");

  return `- [${title}](${absoluteUrl(path)})${metadata ? `: ${metadata}` : ""}`;
}

export async function GET() {
  const [posts, pages, caseStudies] = await Promise.all([
    getCollection("blog", ({ data }) => !data.draft),
    getCollection("pages", ({ data }) => !data.draft),
    getCollection("case-studies", ({ data }) => !data.draft),
  ]);

  const sortedPosts = posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
  const sortedPages = pages.sort((a, b) =>
    a.data.title.localeCompare(b.data.title, "en-GB"),
  );
  const sortedCaseStudies = caseStudies.sort(
    (a, b) =>
      a.data.order - b.data.order ||
      b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  const body = [
    "# Daniel Marcinkowski",
    "",
    "> Personal website and writing by Daniel Marcinkowski about technology, productivity, marketing, university, and humane digital life.",
    "",
    "This file is intended to help AI assistants, search agents, and other automated readers quickly discover the most useful public resources on meetdaniel.me.",
    "",
    "## Key pages",
    "",
    ...sortedPages.map((page) =>
      listItem(
        page.data.title,
        `/${getEntrySlug(page)}/`,
        page.data.description,
        page.data.updatedDate,
      ),
    ),
    "",
    "## Work and case studies",
    "",
    ...sortedCaseStudies.map((study) =>
      listItem(
        study.data.title,
        `/work/${getEntrySlug(study)}/`,
        study.data.description,
        study.data.updatedDate,
      ),
    ),
    "",
    "## Recent writing",
    "",
    ...sortedPosts.slice(0, 25).map((post) =>
      listItem(
        post.data.title,
        `/blog/${getEntrySlug(post)}/`,
        post.data.description,
        post.data.updatedDate ?? post.data.pubDate,
      ),
    ),
    "",
    "## Feeds and indexes",
    "",
    `- [RSS feed](${absoluteUrl("/rss.xml")})`,
    `- [Sitemap](${absoluteUrl("/sitemap.xml")})`,
    `- [Search index](${absoluteUrl("/search.json")})`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
