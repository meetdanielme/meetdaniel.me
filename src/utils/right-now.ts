import type { CollectionEntry } from "astro:content";
import { getEntrySlug } from "./content";

export const RIGHT_NOW_MAX_LENGTH = 280;
export const RIGHT_NOW_DESCRIPTION =
  "Short posts from what I am doing, thinking, or noticing right now.";

export type RightNowEntry = CollectionEntry<"right-now">;
type RightNowEntryIdentifier = Pick<RightNowEntry, "id" | "slug">;
type RightNowPermalinkMap = Map<string, string>;
const urlPattern = /https?:\/\/[^\s<>"')]+/gi;

export const sortRightNowPosts = (posts: RightNowEntry[]) =>
  posts.sort((a, b) => b.data.createdAt.valueOf() - a.data.createdAt.valueOf());

export const getRightNowPostPath = (slug: string) => `/right-now/${slug}/`;

export const getRightNowSlug = (post: RightNowEntryIdentifier) =>
  getEntrySlug(post);

export const buildRightNowPermalinkMap = (posts: RightNowEntry[]) => {
  const perDayCounters = new Map<string, number>();
  const permalinkMap: RightNowPermalinkMap = new Map();

  const chronologicallySorted = [...posts].sort((a, b) => {
    const timeDifference = a.data.createdAt.valueOf() - b.data.createdAt.valueOf();
    if (timeDifference !== 0) return timeDifference;

    return getRightNowSlug(a).localeCompare(getRightNowSlug(b));
  });

  for (const post of chronologicallySorted) {
    const day = post.data.createdAt.toISOString().slice(0, 10);
    const sequence = (perDayCounters.get(day) ?? 0) + 1;
    perDayCounters.set(day, sequence);

    permalinkMap.set(post.id, `${day}-${String(sequence).padStart(2, "0")}`);
  }

  return permalinkMap;
};

export const getRightNowPermalinkSlug = (
  post: RightNowEntry,
  permalinkMap: RightNowPermalinkMap,
) => {
  return (
    permalinkMap.get(post.id) ??
    `${post.data.createdAt.toISOString().slice(0, 10)}-01`
  );
};

export const formatRightNowDate = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const formatRightNowDateTime = (date: Date) =>
  `${date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  })}, ${date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Europe/Berlin",
  })} (${new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    timeZoneName: "short",
  })
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value || "CET"})`;

export const formatRightNowRelativeTime = (date: Date, now = new Date()) => {
  const elapsedMs = Math.max(0, now.valueOf() - date.valueOf());
  const elapsedMinutes = Math.max(1, Math.floor(elapsedMs / 60000));
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  const elapsedDays = Math.floor(elapsedHours / 24);
  const elapsedYears = Math.floor(elapsedDays / 365);

  if (elapsedYears >= 1) {
    return formatRightNowDate(date);
  }

  if (elapsedDays >= 1) {
    return `${elapsedDays}d`;
  }

  if (elapsedHours >= 1) {
    return `${elapsedHours}h`;
  }

  return `${elapsedMinutes}m`;
};

export const countRightNowCharacters = (text: string) =>
  Array.from(text.trim()).length;

export const isValidRightNowText = (text: string) => {
  const length = countRightNowCharacters(text);
  return length > 0 && length <= RIGHT_NOW_MAX_LENGTH;
};

export const extractRightNowUrls = (text: string) =>
  Array.from(new Set(text.match(urlPattern) ?? []));

export const formatRightNowDisplayUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const hostname = formatRightNowDomain(url);
    const path = `${parsed.pathname}${parsed.search}`.replace(/\/$/, "");
    const displayUrl = `${hostname}${path === "/" ? "" : path}`;

    if (displayUrl.length <= 38) return displayUrl;

    return `${displayUrl.slice(0, 35)}...`;
  } catch {
    if (url.length <= 38) return url;

    return `${url.slice(0, 35)}...`;
  }
};

export const formatRightNowDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const renderRightNowText = (text: string) => {
  const escaped = escapeHtml(text.replace(/\r\n?/g, "\n").trim());

  return escaped
    .replace(urlPattern, (url) => {
      const href = url.startsWith("http") ? url : `https://${url}`;
      const displayUrl = formatRightNowDisplayUrl(href);
      return `<a href="${href}" rel="noopener noreferrer">${displayUrl}</a>`;
    })
    .replaceAll("\n", "<br>");
};
