import { getCollection, type CollectionEntry } from "astro:content";

export type CaseStudy = CollectionEntry<"case-studies">;

// Preferred display order for case study tags; unknown tags sort after these.
const TAG_ORDER = ["Work", "Personal", "University"];

export function caseStudyTagSlug(tag: string) {
  return tag.toLowerCase().replaceAll(" ", "-");
}

export function caseStudyTagHref(tag: string) {
  return `/work/tags/${caseStudyTagSlug(tag)}/`;
}

export async function getPublishedCaseStudies() {
  const studies = await getCollection("case-studies", ({ data }) => !data.draft);
  return studies.sort(
    (a, b) =>
      a.data.order - b.data.order ||
      b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export function getCaseStudyTags(studies: CaseStudy[]) {
  const rank = (tag: string) => {
    const index = TAG_ORDER.indexOf(tag);
    return index === -1 ? TAG_ORDER.length : index;
  };
  return [...new Set(studies.flatMap((study) => study.data.tags))].sort(
    (a, b) => rank(a) - rank(b) || a.localeCompare(b),
  );
}
