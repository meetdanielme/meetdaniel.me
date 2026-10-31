import { getCollection } from "astro:content";
import { sortRightNowPosts } from "./right-now";
import { RIGHT_NOW_ENABLED } from "./site-features";

const rightNowEntryModules = import.meta.glob("../content/right-now/*.md");

export const hasRightNowSourceEntries = () =>
  Object.keys(rightNowEntryModules).length > 0;

export const getPublishedRightNowPosts = async () => {
  if (!RIGHT_NOW_ENABLED || !hasRightNowSourceEntries()) return [];

  return sortRightNowPosts(
    await getCollection("right-now", ({ data }) => !data.draft),
  );
};
