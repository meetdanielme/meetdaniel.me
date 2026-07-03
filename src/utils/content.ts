type ContentEntryWithId = {
  id: string;
  slug?: string;
};

export function getEntrySlug(entry: ContentEntryWithId) {
  return entry.slug ?? entry.id.replace(/\.(md|mdx)$/i, "");
}
