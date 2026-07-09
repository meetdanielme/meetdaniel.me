import type { APIContext } from "astro";
import { Buffer } from "node:buffer";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { put } from "@vercel/blob";
import {
  RIGHT_NOW_MAX_LENGTH,
  countRightNowCharacters,
  extractRightNowUrls,
  isValidRightNowText,
} from "../../../utils/right-now";
import { hasValidRightNowSession } from "../../../utils/right-now-auth";
import { crossPostRightNow } from "../../../utils/social";

export const prerender = false;

type MediaAttachment = {
  type: "image" | "video";
  src: string;
  alt: string;
  mimeType: string;
  size: number;
};

type LinkPreview = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
};

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const allowedVideoTypes = new Set(["video/mp4", "video/quicktime", "video/webm"]);
const maxFiles = 4;
const maxImageSize = 10 * 1024 * 1024;
const maxVideoSize = 100 * 1024 * 1024;
const isLocalPublish = import.meta.env.RIGHT_NOW_LOCAL_PUBLISH === "true";
const isCrossPostingEnabled =
  import.meta.env.RIGHT_NOW_ENABLE_CROSSPOSTING === "true";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

const getExtension = (file: File) => {
  const extensionFromName = file.name.split(".").pop()?.toLowerCase();

  if (extensionFromName && /^[a-z0-9]+$/.test(extensionFromName)) {
    return extensionFromName;
  }

  return (
    {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "video/mp4": "mp4",
      "video/quicktime": "mov",
      "video/webm": "webm",
    }[file.type] || "bin"
  );
};

const getMediaKind = (file: File): "image" | "video" | undefined => {
  if (allowedImageTypes.has(file.type)) return "image";
  if (allowedVideoTypes.has(file.type)) return "video";
  return undefined;
};

const yamlString = (value: string) => JSON.stringify(value);
const normalizeLocation = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim().slice(0, 120) : "";
const isChecked = (value: FormDataEntryValue | null) => value === "on";
const getPostSlug = (createdAt: Date) =>
  createdAt
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "-")
    .replace("Z", "z");

const formatMediaYaml = (media: MediaAttachment[]) => {
  if (media.length === 0) return "media: []";

  return [
    "media:",
    ...media.flatMap((item) => [
      `  - type: ${yamlString(item.type)}`,
      `    src: ${yamlString(item.src)}`,
      `    alt: ${yamlString(item.alt)}`,
      `    mimeType: ${yamlString(item.mimeType)}`,
      `    size: ${item.size}`,
    ]),
  ].join("\n");
};

const formatLinksYaml = (links: LinkPreview[]) => {
  if (links.length === 0) return "links: []";

  return [
    "links:",
    ...links.flatMap((item) => [
      `  - url: ${yamlString(item.url)}`,
      ...(item.title ? [`    title: ${yamlString(item.title)}`] : []),
      ...(item.description
        ? [`    description: ${yamlString(item.description)}`]
        : []),
      ...(item.image ? [`    image: ${yamlString(item.image)}`] : []),
      ...(item.siteName ? [`    siteName: ${yamlString(item.siteName)}`] : []),
    ]),
  ].join("\n");
};

const buildPostMarkdown = ({
  text,
  createdAt,
  location,
  media,
  links,
  syndication,
}: {
  text: string;
  createdAt: string;
  location: string;
  media: MediaAttachment[];
  links: LinkPreview[];
  syndication: {
    mastodon?: string | null;
    bluesky?: string | null;
  };
}) => `---
text: ${yamlString(text)}
createdAt: ${yamlString(createdAt)}
${location ? `location: ${yamlString(location)}\n` : ""}${formatMediaYaml(media)}
${formatLinksYaml(links)}
syndication:
  mastodon: ${syndication.mastodon ? yamlString(syndication.mastodon) : "null"}
  bluesky: ${syndication.bluesky ? yamlString(syndication.bluesky) : "null"}
  threads: null
  twitter: null
draft: false
---
`;

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const normalizePreviewText = (value: string) =>
  decodeHtmlEntities(value.replace(/\s+/g, " ").trim()).slice(0, 240);

const getAttribute = (tag: string, name: string) =>
  tag.match(new RegExp(`${name}=["']([^"']+)["']`, "i"))?.[1];

const getMetaContent = (html: string, key: string) => {
  const metaTags = html.match(/<meta\s+[^>]*>/gi) || [];

  for (const tag of metaTags) {
    const property = getAttribute(tag, "property") || getAttribute(tag, "name");
    if (property?.toLowerCase() !== key.toLowerCase()) continue;

    const content = getAttribute(tag, "content");
    if (content) return content;
  }

  return undefined;
};

const getTitle = (html: string) => html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];

const fetchLinkPreview = async (url: string): Promise<LinkPreview> => {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "meetdaniel.me Right Now link preview",
      },
      signal: AbortSignal.timeout(4500),
    });

    if (!response.ok) return { url };
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return { url };

    const html = await response.text();
    const title =
      getMetaContent(html, "og:title") ||
      getMetaContent(html, "twitter:title") ||
      getTitle(html);
    const description =
      getMetaContent(html, "og:description") ||
      getMetaContent(html, "twitter:description") ||
      getMetaContent(html, "description");
    const image =
      getMetaContent(html, "og:image") ||
      getMetaContent(html, "twitter:image");
    const siteName = getMetaContent(html, "og:site_name");

    return {
      url,
      ...(title ? { title: normalizePreviewText(title) } : {}),
      ...(description
        ? { description: normalizePreviewText(description) }
        : {}),
      ...(image ? { image: new URL(decodeHtmlEntities(image), url).href } : {}),
      ...(siteName ? { siteName: normalizePreviewText(siteName) } : {}),
    };
  } catch {
    return { url };
  }
};

const getLinkPreviews = async (text: string) =>
  Promise.all(extractRightNowUrls(text).slice(0, 2).map(fetchLinkPreview));

const uploadMedia = async (
  files: File[],
  altTexts: string[],
  createdAt: Date,
) => {
  const uploaded: MediaAttachment[] = [];
  const datePath = createdAt.toISOString().slice(0, 10).replaceAll("-", "/");
  const timestamp = createdAt
    .toISOString()
    .replaceAll(":", "-")
    .replace(".", "-");

  for (const [index, file] of files.entries()) {
    const kind = getMediaKind(file);

    if (!kind) {
      throw new Error(`Unsupported media type: ${file.type || file.name}`);
    }

    const maxSize = kind === "image" ? maxImageSize : maxVideoSize;
    if (file.size > maxSize) {
      throw new Error(
        `${file.name} is too large for the ${kind} upload limit.`,
      );
    }

    const extension = getExtension(file);
    const baseName = slugify(file.name.replace(/\.[^.]+$/, "")) || "media";
    const pathname = `right-now/${datePath}/${timestamp}-${index + 1}-${baseName}.${extension}`;
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: file.type || undefined,
      multipart: kind === "video",
    });

    uploaded.push({
      type: kind,
      src: blob.url,
      alt: altTexts[index] || "",
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    });
  }

  return uploaded;
};

const uploadLocalMedia = async (
  files: File[],
  altTexts: string[],
  createdAt: Date,
) => {
  const uploaded: MediaAttachment[] = [];
  const datePath = createdAt.toISOString().slice(0, 10).replaceAll("-", "/");
  const timestamp = createdAt
    .toISOString()
    .replaceAll(":", "-")
    .replace(".", "-");
  const outputDir = join(process.cwd(), "public", "images", "right-now", "local", datePath);

  await mkdir(outputDir, { recursive: true });

  for (const [index, file] of files.entries()) {
    const kind = getMediaKind(file);

    if (!kind) {
      throw new Error(`Unsupported media type: ${file.type || file.name}`);
    }

    const maxSize = kind === "image" ? maxImageSize : maxVideoSize;
    if (file.size > maxSize) {
      throw new Error(
        `${file.name} is too large for the ${kind} upload limit.`,
      );
    }

    const extension = getExtension(file);
    const baseName = slugify(file.name.replace(/\.[^.]+$/, "")) || "media";
    const fileName = `${timestamp}-${index + 1}-${baseName}.${extension}`;
    await writeFile(
      join(outputDir, fileName),
      Buffer.from(await file.arrayBuffer()),
    );

    uploaded.push({
      type: kind,
      src: `/images/right-now/local/${datePath}/${fileName}`,
      alt: altTexts[index] || "",
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    });
  }

  return uploaded;
};

const commitPost = async ({
  markdown,
  createdAt,
}: {
  markdown: string;
  createdAt: Date;
}) => {
  const token =
    import.meta.env.RIGHT_NOW_GITHUB_TOKEN || import.meta.env.GITHUB_TOKEN;
  const repo = import.meta.env.RIGHT_NOW_GITHUB_REPO || "meetdanielme/meetdaniel.me";
  const branch =
    import.meta.env.RIGHT_NOW_GITHUB_BRANCH ||
    import.meta.env.VERCEL_GIT_COMMIT_REF ||
    "main";

  if (!token) {
    throw new Error("Missing RIGHT_NOW_GITHUB_TOKEN or GITHUB_TOKEN.");
  }

  const [owner, repoName] = repo.split("/");
  if (!owner || !repoName) {
    throw new Error("RIGHT_NOW_GITHUB_REPO must use owner/repo format.");
  }

  const slug = getPostSlug(createdAt);
  const path = `src/content/right-now/${slug}.md`;
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        message: `Post Right Now update ${createdAt.toISOString()}`,
        content: Buffer.from(markdown).toString("base64"),
        branch,
        committer: {
          name: "Daniel Marcinkowski",
          email: "hey@meetdaniel.me",
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub commit failed: ${response.status} ${error}`);
  }

  return { path, branch };
};

const writeLocalPost = async ({
  markdown,
  createdAt,
}: {
  markdown: string;
  createdAt: Date;
}) => {
  const path = `src/content/right-now/${getPostSlug(createdAt)}.md`;
  await writeFile(join(process.cwd(), path), markdown);

  return { path, branch: "local" };
};

export async function POST(context: APIContext) {
  if (!(await hasValidRightNowSession(context.cookies))) {
    return json({ error: "Not authorised." }, 401);
  }

  const formData = await context.request.formData();
  const text = String(formData.get("text") || "").trim();
  const location = normalizeLocation(formData.get("location"));
  const shouldCrossPostToMastodon = isChecked(formData.get("crosspostMastodon"));
  const shouldCrossPostToBluesky = isChecked(formData.get("crosspostBluesky"));

  if (!isValidRightNowText(text)) {
    return json(
      {
        error: `Text must be between 1 and ${RIGHT_NOW_MAX_LENGTH} characters.`,
        count: countRightNowCharacters(text),
      },
      400,
    );
  }

  const files = formData
    .getAll("media")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length > maxFiles) {
    return json({ error: `Add up to ${maxFiles} media files.` }, 400);
  }

  const altTexts = String(formData.get("altText") || "")
    .split("\n")
    .map((line) => line.trim());
  const createdAt = new Date();

  try {
    const media = isLocalPublish
      ? await uploadLocalMedia(files, altTexts, createdAt)
      : await uploadMedia(files, altTexts, createdAt);
    const syndication = isCrossPostingEnabled
      ? await crossPostRightNow({
          text,
          mastodon: shouldCrossPostToMastodon,
          bluesky: shouldCrossPostToBluesky,
        })
      : {};
    const links = await getLinkPreviews(text);
    const markdown = buildPostMarkdown({
      text,
      media,
      links,
      location,
      syndication,
      createdAt: createdAt.toISOString(),
    });
    const commit = isLocalPublish
      ? await writeLocalPost({ markdown, createdAt })
      : await commitPost({ markdown, createdAt });

    return json({
      ok: true,
      message: isLocalPublish
        ? "Published locally. Restart or refresh the dev server if the new post does not appear immediately."
        : "Published. Vercel will show it after the next deployment.",
      commit,
    });
  } catch (error) {
    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Publishing failed unexpectedly.",
      },
      500,
    );
  }
}
