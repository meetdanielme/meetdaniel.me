const youtubePattern =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
const keynotePattern = /https:\/\/www\.icloud\.com\/keynote\/[^\s<"']+/;
const wrapperPattern =
  /<div class="wp-block-embed__wrapper">\s*([^<\s]+)\s*<\/div>/;

const escapeHtml = (value = "") =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const youtubeEmbed = (url) => {
  const id = url.match(youtubePattern)?.[1];
  if (!id) return undefined;

  return `<div class="content-embed content-embed-youtube"><lite-youtube videoid="${id}" style="background-image: url('https://i.ytimg.com/vi/${id}/hqdefault.jpg')"><a href="https://youtube.com/watch?v=${id}" class="lyt-playbtn"><span class="lyt-visually-hidden">Play video</span></a></lite-youtube></div>`;
};

const keynoteEmbed = (url) =>
  `<div class="content-embed content-embed-card"><i class="ri-slideshow-line" aria-hidden="true"></i><div><p class="content-embed-label">Keynote slides</p><a href="${escapeHtml(url)}">Open presentation</a></div></div>`;

const embedForUrl = (url) => {
  if (youtubePattern.test(url)) return youtubeEmbed(url);
  if (keynotePattern.test(url)) return keynoteEmbed(url);
  return undefined;
};

const getPlainText = (node) => {
  if (!node) return "";
  if (node.type === "text" || node.type === "html") return node.value || "";
  if (!node.children) return "";
  return node.children.map(getPlainText).join("");
};

const transformNode = (node) => {
  if (node.type === "html") {
    if (!node.value.includes("wp-block-embed")) return;

    const wrapperUrl = node.value.match(wrapperPattern)?.[1];
    const url = wrapperUrl
      ? wrapperUrl.match(youtubePattern)?.[0] ||
        wrapperUrl.match(keynotePattern)?.[0]
      : undefined;
    const embed = url ? embedForUrl(url) : undefined;
    if (embed) {
      node.value = embed;
    }
    return;
  }

  if (node.type === "paragraph") {
    if (node.children?.length !== 1) return;

    const [child] = node.children;
    const linkText = child?.type === "link" ? getPlainText(child).trim() : "";
    const linkUrl = child?.type === "link" ? child.url?.trim() : "";

    const candidates = [linkText === linkUrl ? linkUrl : undefined, getPlainText(node)]
      .filter(Boolean)
      .map((value) => value.trim());
    const embed = candidates
      .map((text) =>
        text.match(youtubePattern)?.[0] === text
          ? embedForUrl(text)
          : text.match(keynotePattern)?.[0] === text
            ? embedForUrl(text)
            : undefined,
      )
      .find(Boolean);

    if (embed) {
      node.type = "html";
      node.value = embed;
      delete node.children;
    }
  }
};

const walk = (node) => {
  transformNode(node);
  node.children?.forEach(walk);
};

export default function remarkEmbeds() {
  return (tree) => walk(tree);
}
