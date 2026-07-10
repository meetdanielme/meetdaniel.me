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

const postToMastodon = async (text: string) => {
  const instanceUrl = trimTrailingSlash(
    requireEnv("MASTODON_INSTANCE_URL", import.meta.env.MASTODON_INSTANCE_URL),
  );
  const accessToken = requireEnv(
    "MASTODON_ACCESS_TOKEN",
    import.meta.env.MASTODON_ACCESS_TOKEN,
  );
  const formData = new FormData();
  formData.set("status", text);

  const response = await fetch(`${instanceUrl}/api/v1/statuses`, {
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

const createBlueskySession = async () => {
  const serviceUrl = trimTrailingSlash(
    import.meta.env.BLUESKY_SERVICE_URL || "https://bsky.social",
  );
  const identifier = requireEnv(
    "BLUESKY_HANDLE",
    import.meta.env.BLUESKY_HANDLE,
  );
  const password = requireEnv(
    "BLUESKY_APP_PASSWORD",
    import.meta.env.BLUESKY_APP_PASSWORD,
  );
  const response = await fetch(
    `${serviceUrl}/xrpc/com.atproto.server.createSession`,
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
    serviceUrl,
    identifier,
    accessJwt: session.accessJwt,
    did: session.did,
  };
};

const postToBluesky = async (text: string) => {
  const session = await createBlueskySession();
  const facets = buildBlueskyLinkFacets(text);
  const response = await fetch(
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
      publishers.mastodon || (() => postToMastodon(text)),
    );
  }

  if (bluesky) {
    await attempt(
      "Bluesky",
      "bluesky",
      publishers.bluesky || (() => postToBluesky(text)),
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
