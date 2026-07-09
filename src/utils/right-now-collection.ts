import { getCollection } from "astro:content";
import { sortRightNowPosts } from "./right-now";

const rightNowEntryModules = import.meta.glob("../content/right-now/*.md");

export const hasRightNowSourceEntries = () =>
  Object.keys(rightNowEntryModules).length > 0;

export const getPublishedRightNowPosts = async () => {
  if (!hasRightNowSourceEntries()) return [];

  return sortRightNowPosts(
    await getCollection("right-now", ({ data }) => !data.draft),
  );
};
