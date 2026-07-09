type CrossPostResult = {
  mastodon?: string | null;
  bluesky?: string | null;
};

type CrossPostOptions = {
  text: string;
  mastodon: boolean;
  bluesky: boolean;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const requireEnv = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
};

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
    throw new Error(`Mastodon post failed: ${response.status} ${await response.text()}`);
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
  const identifier = requireEnv("BLUESKY_HANDLE", import.meta.env.BLUESKY_HANDLE);
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
    throw new Error(`Bluesky session failed: ${response.status} ${await response.text()}`);
  }

  const session = await response.json();
  if (
    typeof session.accessJwt !== "string" ||
    typeof session.did !== "string"
  ) {
    throw new Error("Bluesky did not return an access token and DID.");
  }

  return { serviceUrl, identifier, accessJwt: session.accessJwt, did: session.did };
};

const postToBluesky = async (text: string) => {
  const session = await createBlueskySession();
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
          "$type": "app.bsky.feed.post",
          text,
          createdAt: new Date().toISOString(),
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Bluesky post failed: ${response.status} ${await response.text()}`);
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

export const crossPostRightNow = async ({
  text,
  mastodon,
  bluesky,
}: CrossPostOptions): Promise<CrossPostResult> => {
  const result: CrossPostResult = {};

  if (mastodon) {
    result.mastodon = await postToMastodon(text);
  }

  if (bluesky) {
    result.bluesky = await postToBluesky(text);
  }

  return result;
};
