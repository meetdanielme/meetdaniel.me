export type RightNowMediaAttachment = {
  type: "image" | "video";
  src: string;
  alt: string;
  mimeType: string;
  size: number;
};

export type RightNowLinkPreview = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
};

const yamlString = (value: string) => JSON.stringify(value);

const formatMediaYaml = (media: RightNowMediaAttachment[]) => {
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

const formatLinksYaml = (links: RightNowLinkPreview[]) => {
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

export const buildRightNowPostMarkdown = ({
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
  media: RightNowMediaAttachment[];
  links: RightNowLinkPreview[];
  syndication: {
    mastodon?: string | null;
    bluesky?: string | null;
    threads?: string | null;
  };
}) => `---
text: ${yamlString(text)}
createdAt: ${yamlString(createdAt)}
${location ? `location: ${yamlString(location)}\n` : ""}${formatMediaYaml(media)}
${formatLinksYaml(links)}
syndication:
  mastodon: ${syndication.mastodon ? yamlString(syndication.mastodon) : "null"}
  bluesky: ${syndication.bluesky ? yamlString(syndication.bluesky) : "null"}
  threads: ${syndication.threads ? yamlString(syndication.threads) : "null"}
  twitter: null
draft: false
---
`;
