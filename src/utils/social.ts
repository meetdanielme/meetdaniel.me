type CrossPostResult = {
  mastodon?: string | null;
  bluesky?: string | null;
  threads?: string | null;
  warnings: string[];
};

export type CrossPostMedia = {
  type: "image" | "video";
  src: string;
  alt?: string;
  mimeType?: string;
};

type CrossPostOptions = {
  text: string;
  media: CrossPostMedia[];
  mastodon: boolean;
  bluesky: boolean;
  threads: boolean;
};

type CrossPostPublishers = {
  mastodon?: () => Promise<string>;
  bluesky?: () => Promise<string>;
  threads?: () => Promise<string>;
};

const blueskyUrlPattern = /https?:\/\/[^\s<>"')]+/gi;
const threadsApiUrl = "https://graph.threads.net/v1.0";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const requireEnv = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
};

const parseApiResponse = async (response: Response, platform: string) => {
  const body = await response.json().catch(() => undefined);

  if (!response.ok) {
    const message =
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof body.error === "string"
        ? body.error
        : body &&
            typeof body === "object" &&
            "error" in body &&
            body.error &&
            typeof body.error === "object" &&
            "message" in body.error &&
            typeof body.error.message === "string"
          ? body.error.message
          : `${response.status} ${response.statusText}`.trim();
    throw new Error(`${platform} request failed: ${message}`);
  }

  return body;
};

const downloadMedia = async (
  media: CrossPostMedia,
  fetchImpl: typeof fetch,
) => {
  const url = new URL(media.src);
  if (url.protocol !== "https:") {
    throw new Error("Cross-posted media must use a public HTTPS URL.");
  }

  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(
      `Could not download media: ${response.status} ${response.statusText}`.trim(),
    );
  }

  const downloaded = await response.blob();
  const mimeType =
    downloaded.type ||
    media.mimeType ||
    (media.type === "image" ? "image/jpeg" : "video/mp4");
  const pathname = url.pathname.split("/").pop();
  const filename =
    (pathname && decodeURIComponent(pathname)) ||
    (media.type === "image" ? "image.jpg" : "video.mp4");

  return {
    blob:
      downloaded.type === mimeType
        ? downloaded
        : new Blob([downloaded], { type: mimeType }),
    filename,
  };
};

const assertPublicMediaUrl = (value: string) => {
  const url = new URL(value);
  if (url.protocol !== "https:") {
    throw new Error("Threads media must use a public HTTPS URL.");
  }
  return url.toString();
};

const waitForThreadsContainer = async (
  containerId: string,
  accessToken: string,
  fetchImpl: typeof fetch,
) => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const response = await fetchImpl(
      `${threadsApiUrl}/${encodeURIComponent(containerId)}?fields=status,error_message`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const body = await parseApiResponse(response, "Threads");
    const status = body && typeof body.status === "string" ? body.status : "";

    if (status === "FINISHED") return;
    if (status === "ERROR" || status === "EXPIRED") {
      const errorMessage =
        typeof body.error_message === "string" ? `: ${body.error_message}` : "";
      throw new Error(
        `Threads container ${status.toLowerCase()}${errorMessage}`,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("Threads media was not ready after 30 seconds.");
};

const createThreadsContainer = async (
  userId: string,
  accessToken: string,
  parameters: Record<string, string>,
  fetchImpl: typeof fetch,
) => {
  const response = await fetchImpl(
    `${threadsApiUrl}/${encodeURIComponent(userId)}/threads`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: new URLSearchParams(parameters),
    },
  );
  const body = await parseApiResponse(response, "Threads");
  if (!body || typeof body.id !== "string") {
    throw new Error("Threads did not return a container ID.");
  }
  return body.id;
};

export const postToThreads = async (
  {
    text,
    media,
    userId,
    accessToken,
  }: {
    text: string;
    media: CrossPostMedia[];
    userId: string;
    accessToken: string;
  },
  fetchImpl: typeof fetch = fetch,
) => {
  let containerId: string;

  if (media.length === 0) {
    containerId = await createThreadsContainer(
      userId,
      accessToken,
      { media_type: "TEXT", text },
      fetchImpl,
    );
  } else if (media.length === 1) {
    const item = media[0];
    const parameters: Record<string, string> = {
      media_type: item.type.toUpperCase(),
      text,
      [item.type === "image" ? "image_url" : "video_url"]: assertPublicMediaUrl(
        item.src,
      ),
    };
    if (item.type === "image" && item.alt) parameters.alt_text = item.alt;
    containerId = await createThreadsContainer(
      userId,
      accessToken,
      parameters,
      fetchImpl,
    );
  } else {
    const children: string[] = [];
    for (const item of media) {
      const parameters: Record<string, string> = {
        media_type: item.type.toUpperCase(),
        is_carousel_item: "true",
        [item.type === "image" ? "image_url" : "video_url"]:
          assertPublicMediaUrl(item.src),
      };
      if (item.type === "image" && item.alt) parameters.alt_text = item.alt;
      const childId = await createThreadsContainer(
        userId,
        accessToken,
        parameters,
        fetchImpl,
      );
      children.push(childId);
    }

    await Promise.all(
      children.map((childId) =>
        waitForThreadsContainer(childId, accessToken, fetchImpl),
      ),
    );
    containerId = await createThreadsContainer(
      userId,
      accessToken,
      { media_type: "CAROUSEL", children: children.join(","), text },
      fetchImpl,
    );
  }

  await waitForThreadsContainer(containerId, accessToken, fetchImpl);

  const publishResponse = await fetchImpl(
    `${threadsApiUrl}/${encodeURIComponent(userId)}/threads_publish`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: new URLSearchParams({ creation_id: containerId }),
    },
  );
  const published = await parseApiResponse(publishResponse, "Threads");
  if (!published || typeof published.id !== "string") {
    throw new Error("Threads did not return a published media ID.");
  }

  const permalinkResponse = await fetchImpl(
    `${threadsApiUrl}/${encodeURIComponent(published.id)}?fields=permalink`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  const permalink = await parseApiResponse(permalinkResponse, "Threads");
  if (!permalink || typeof permalink.permalink !== "string") {
    throw new Error("Threads did not return a public post URL.");
  }

  return permalink.permalink;
};

export const buildBlueskyLinkFacets = (text: string) =>
  Array.from(text.matchAll(blueskyUrlPattern)).map((match) => {
    const url = match[0];
    const characterStart = match.index ?? 0;
    const characterEnd = characterStart + url.length;

    return {
      index: {
        byteStart: new TextEncoder().encode(text.slice(0, characterStart))
          .length,
        byteEnd: new TextEncoder().encode(text.slice(0, characterEnd)).length,
      },
      features: [
        {
          $type: "app.bsky.richtext.facet#link",
          uri: url,
        },
      ],
    };
  });

const waitForMastodonMedia = async (
  instanceUrl: string,
  mediaId: string,
  accessToken: string,
  fetchImpl: typeof fetch,
) => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const response = await fetchImpl(
      `${instanceUrl}/api/v1/media/${encodeURIComponent(mediaId)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const attachment = await parseApiResponse(response, "Mastodon");
    if (
      attachment &&
      typeof attachment === "object" &&
      "url" in attachment &&
      typeof attachment.url === "string" &&
      attachment.url
    ) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("Mastodon media was not ready after 30 seconds.");
};

export const postToMastodon = async (
  {
    text,
    media,
    instanceUrl,
    accessToken,
  }: {
    text: string;
    media: CrossPostMedia[];
    instanceUrl: string;
    accessToken: string;
  },
  fetchImpl: typeof fetch = fetch,
) => {
  const baseUrl = trimTrailingSlash(instanceUrl);
  const mediaIds: string[] = [];

  for (const item of media) {
    const downloaded = await downloadMedia(item, fetchImpl);
    const upload = new FormData();
    upload.set("file", downloaded.blob, downloaded.filename);
    if (item.alt) upload.set("description", item.alt);

    const uploadResponse = await fetchImpl(`${baseUrl}/api/v2/media`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: upload,
    });
    const attachment = await parseApiResponse(uploadResponse, "Mastodon");
    if (
      !attachment ||
      typeof attachment !== "object" ||
      !("id" in attachment) ||
      typeof attachment.id !== "string"
    ) {
      throw new Error("Mastodon did not return a media attachment ID.");
    }

    mediaIds.push(attachment.id);
    if (
      uploadResponse.status === 202 ||
      !("url" in attachment) ||
      typeof attachment.url !== "string" ||
      !attachment.url
    ) {
      await waitForMastodonMedia(
        baseUrl,
        attachment.id,
        accessToken,
        fetchImpl,
      );
    }
  }

  const formData = new FormData();
  formData.set("status", text);
  mediaIds.forEach((id) => formData.append("media_ids[]", id));

  const response = await fetchImpl(`${baseUrl}/api/v1/statuses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      `Mastodon post failed: ${response.status} ${await response.text()}`,
    );
  }

  const status = await response.json();
  if (typeof status.url !== "string") {
    throw new Error("Mastodon did not return a public status URL.");
  }

  return status.url;
};

const createBlueskySession = async (
  {
    serviceUrl,
    identifier,
    password,
  }: {
    serviceUrl: string;
    identifier: string;
    password: string;
  },
  fetchImpl: typeof fetch,
) => {
  const baseUrl = trimTrailingSlash(serviceUrl);
  const response = await fetchImpl(
    `${baseUrl}/xrpc/com.atproto.server.createSession`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Bluesky session failed: ${response.status} ${await response.text()}`,
    );
  }

  const session = await response.json();
  if (
    typeof session.accessJwt !== "string" ||
    typeof session.did !== "string"
  ) {
    throw new Error("Bluesky did not return an access token and DID.");
  }

  return {
    serviceUrl: baseUrl,
    identifier,
    accessJwt: session.accessJwt,
    did: session.did,
  };
};

export const postToBluesky = async (
  {
    text,
    media,
    serviceUrl,
    identifier,
    password,
  }: {
    text: string;
    media: CrossPostMedia[];
    serviceUrl: string;
    identifier: string;
    password: string;
  },
  fetchImpl: typeof fetch = fetch,
) => {
  const session = await createBlueskySession(
    { serviceUrl, identifier, password },
    fetchImpl,
  );
  const facets = buildBlueskyLinkFacets(text);
  let embed: Record<string, unknown> | undefined;

  if (media.length > 0) {
    const hasImages = media.some((item) => item.type === "image");
    const hasVideos = media.some((item) => item.type === "video");
    if (hasImages && hasVideos) {
      throw new Error("Bluesky cannot attach images and video to one post.");
    }
    if (hasVideos && media.length > 1) {
      throw new Error("Bluesky supports one video attachment per post.");
    }

    const uploaded = [];
    for (const item of media) {
      const downloaded = await downloadMedia(item, fetchImpl);
      const uploadResponse = await fetchImpl(
        `${session.serviceUrl}/xrpc/com.atproto.repo.uploadBlob`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessJwt}`,
            "Content-Type": downloaded.blob.type,
          },
          body: downloaded.blob,
        },
      );
      const upload = await parseApiResponse(uploadResponse, "Bluesky");
      if (
        !upload ||
        typeof upload !== "object" ||
        !("blob" in upload) ||
        !upload.blob
      ) {
        throw new Error("Bluesky did not return an uploaded media blob.");
      }
      uploaded.push({ item, blob: upload.blob });
    }

    embed = hasImages
      ? {
          $type: "app.bsky.embed.images",
          images: uploaded.map(({ item, blob }) => ({
            alt: item.alt || "",
            image: blob,
          })),
        }
      : {
          $type: "app.bsky.embed.video",
          video: uploaded[0].blob,
          ...(uploaded[0].item.alt ? { alt: uploaded[0].item.alt } : {}),
        };
  }

  const response = await fetchImpl(
    `${session.serviceUrl}/xrpc/com.atproto.repo.createRecord`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessJwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        repo: session.did,
        collection: "app.bsky.feed.post",
        record: {
          $type: "app.bsky.feed.post",
          text,
          createdAt: new Date().toISOString(),
          ...(facets.length > 0 ? { facets } : {}),
          ...(embed ? { embed } : {}),
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Bluesky post failed: ${response.status} ${await response.text()}`,
    );
  }

  const record = await response.json();
  if (typeof record.uri !== "string") {
    throw new Error("Bluesky did not return a post URI.");
  }

  const postId = record.uri.split("/").pop();
  if (!postId) {
    throw new Error("Could not derive Bluesky post URL from URI.");
  }

  return `https://bsky.app/profile/${session.identifier}/post/${postId}`;
};

export const crossPostRightNow = async (
  { text, media, mastodon, bluesky, threads }: CrossPostOptions,
  publishers: CrossPostPublishers = {},
): Promise<CrossPostResult> => {
  const result: CrossPostResult = { warnings: [] };

  const attempt = async (
    platform: string,
    key: "mastodon" | "bluesky" | "threads",
    publish: () => Promise<string>,
  ) => {
    try {
      result[key] = await publish();
    } catch (error) {
      result[key] = null;
      result.warnings.push(
        `${platform}: ${error instanceof Error ? error.message : "Publishing failed unexpectedly."}`,
      );
    }
  };

  if (mastodon) {
    await attempt(
      "Mastodon",
      "mastodon",
      publishers.mastodon ||
        (() =>
          postToMastodon({
            text,
            media,
            instanceUrl: requireEnv(
              "MASTODON_INSTANCE_URL",
              import.meta.env.MASTODON_INSTANCE_URL,
            ),
            accessToken: requireEnv(
              "MASTODON_ACCESS_TOKEN",
              import.meta.env.MASTODON_ACCESS_TOKEN,
            ),
          })),
    );
  }

  if (bluesky) {
    await attempt(
      "Bluesky",
      "bluesky",
      publishers.bluesky ||
        (() =>
          postToBluesky({
            text,
            media,
            serviceUrl:
              import.meta.env.BLUESKY_SERVICE_URL || "https://bsky.social",
            identifier: requireEnv(
              "BLUESKY_HANDLE",
              import.meta.env.BLUESKY_HANDLE,
            ),
            password: requireEnv(
              "BLUESKY_APP_PASSWORD",
              import.meta.env.BLUESKY_APP_PASSWORD,
            ),
          })),
    );
  }

  if (threads) {
    await attempt(
      "Threads",
      "threads",
      publishers.threads ||
        (() =>
          postToThreads({
            text,
            media,
            userId: requireEnv(
              "THREADS_USER_ID",
              import.meta.env.THREADS_USER_ID,
            ),
            accessToken: requireEnv(
              "THREADS_ACCESS_TOKEN",
              import.meta.env.THREADS_ACCESS_TOKEN,
            ),
          })),
    );
  }

  return result;
};
