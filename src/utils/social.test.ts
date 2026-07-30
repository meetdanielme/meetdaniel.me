import assert from "node:assert/strict";
import test from "node:test";
import {
  buildBlueskyLinkFacets,
  crossPostRightNow,
  postToBluesky,
  postToMastodon,
  postToThreads,
} from "./social";

test("builds UTF-8 byte ranges for Bluesky links", () => {
  const text = "Hello 👋 https://example.com/one and https://example.org/two";

  assert.deepEqual(buildBlueskyLinkFacets(text), [
    {
      index: { byteStart: 11, byteEnd: 34 },
      features: [
        {
          $type: "app.bsky.richtext.facet#link",
          uri: "https://example.com/one",
        },
      ],
    },
    {
      index: { byteStart: 39, byteEnd: 62 },
      features: [
        {
          $type: "app.bsky.richtext.facet#link",
          uri: "https://example.org/two",
        },
      ],
    },
  ]);
});

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

test("publishes a Threads text post and returns its permalink", async () => {
  const requests: Array<{ url: string; body?: URLSearchParams }> = [];
  let statusChecks = 0;
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    const body = init?.body instanceof URLSearchParams ? init.body : undefined;
    requests.push({ url, body });

    if (url.endsWith("/123/threads"))
      return jsonResponse({ id: "container-1" });
    if (url.includes("/container-1?fields=status")) {
      statusChecks += 1;
      return jsonResponse({ status: "FINISHED" });
    }
    if (url.endsWith("/123/threads_publish")) {
      return jsonResponse({ id: "media-1" });
    }
    if (url.includes("/media-1?fields=permalink")) {
      return jsonResponse({
        permalink: "https://www.threads.net/@meetdaniel.me/post/example",
      });
    }

    throw new Error(`Unexpected request: ${url}`);
  };

  const result = await postToThreads(
    {
      text: "A URL https://meetdaniel.me/",
      media: [],
      userId: "123",
      accessToken: "secret",
    },
    fetchImpl,
  );

  assert.equal(result, "https://www.threads.net/@meetdaniel.me/post/example");
  assert.equal(requests[0].body?.get("media_type"), "TEXT");
  assert.equal(requests[0].body?.get("text"), "A URL https://meetdaniel.me/");
  assert.equal(statusChecks, 1);
  const publishRequest = requests.find((request) =>
    request.url.endsWith("/123/threads_publish"),
  );
  assert.equal(publishRequest?.body?.get("creation_id"), "container-1");
});

test("publishes one image to Threads with alt text", async () => {
  const requests: Array<{ url: string; body?: URLSearchParams }> = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    requests.push({
      url,
      body: init?.body instanceof URLSearchParams ? init.body : undefined,
    });

    if (url.endsWith("/123/threads"))
      return jsonResponse({ id: "container-1" });
    if (url.includes("/container-1?fields=status")) {
      return jsonResponse({ status: "FINISHED" });
    }
    if (url.endsWith("/123/threads_publish")) {
      return jsonResponse({ id: "media-1" });
    }
    if (url.includes("/media-1?fields=permalink")) {
      return jsonResponse({ permalink: "https://threads.net/image" });
    }

    throw new Error(`Unexpected request: ${url}`);
  };

  await postToThreads(
    {
      text: "Photo",
      media: [
        {
          type: "image",
          src: "https://example.com/photo.jpg",
          alt: "A descriptive photo",
        },
      ],
      userId: "123",
      accessToken: "secret",
    },
    fetchImpl,
  );

  assert.equal(requests[0].body?.get("media_type"), "IMAGE");
  assert.equal(
    requests[0].body?.get("image_url"),
    "https://example.com/photo.jpg",
  );
  assert.equal(requests[0].body?.get("alt_text"), "A descriptive photo");
});

test("publishes mixed Threads media as a carousel", async () => {
  const requests: Array<{ url: string; body?: URLSearchParams }> = [];
  let childIndex = 0;
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    const body = init?.body instanceof URLSearchParams ? init.body : undefined;
    requests.push({ url, body });

    if (
      url.endsWith("/123/threads") &&
      body?.get("is_carousel_item") === "true"
    ) {
      childIndex += 1;
      return jsonResponse({ id: `child-${childIndex}` });
    }
    if (url.includes("/child-") && url.includes("fields=status")) {
      return jsonResponse({ status: "FINISHED" });
    }
    if (
      url.endsWith("/123/threads") &&
      body?.get("media_type") === "CAROUSEL"
    ) {
      return jsonResponse({ id: "carousel-1" });
    }
    if (url.includes("/carousel-1?fields=status")) {
      return jsonResponse({ status: "FINISHED" });
    }
    if (url.endsWith("/123/threads_publish")) {
      return jsonResponse({ id: "media-1" });
    }
    if (url.includes("/media-1?fields=permalink")) {
      return jsonResponse({ permalink: "https://threads.net/carousel" });
    }

    throw new Error(`Unexpected request: ${url}`);
  };

  await postToThreads(
    {
      text: "Mixed media",
      media: [
        { type: "image", src: "https://example.com/photo.jpg", alt: "Photo" },
        { type: "video", src: "https://example.com/video.mp4", alt: "Video" },
      ],
      userId: "123",
      accessToken: "secret",
    },
    fetchImpl,
  );

  assert.equal(requests[0].body?.get("media_type"), "IMAGE");
  assert.equal(requests[0].body?.get("is_carousel_item"), "true");
  assert.equal(requests[1].body?.get("media_type"), "VIDEO");
  assert.equal(
    requests[1].body?.get("video_url"),
    "https://example.com/video.mp4",
  );
  assert.equal(requests[1].body?.get("is_carousel_item"), "true");
  const carouselRequest = requests.find(
    (request) => request.body?.get("media_type") === "CAROUSEL",
  );
  assert.equal(carouselRequest?.body?.get("children"), "child-1,child-2");
  assert.equal(carouselRequest?.body?.get("text"), "Mixed media");
});

test("uploads Mastodon media and attaches it to the status", async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    requests.push({ url, init });

    if (url === "https://cdn.example/photo.jpg") {
      return new Response(new Uint8Array([1, 2, 3]), {
        headers: { "Content-Type": "image/jpeg" },
      });
    }
    if (url === "https://mastodon.social/api/v2/media") {
      return jsonResponse({
        id: "attachment-1",
        url: "https://mastodon.social/media/photo.jpg",
      });
    }
    if (url === "https://mastodon.social/api/v1/statuses") {
      return jsonResponse({
        url: "https://mastodon.social/@meetdanielme/1",
      });
    }

    throw new Error(`Unexpected request: ${url}`);
  };

  const result = await postToMastodon(
    {
      text: "Photo post",
      media: [
        {
          type: "image",
          src: "https://cdn.example/photo.jpg",
          alt: "A descriptive photo",
        },
      ],
      instanceUrl: "https://mastodon.social/",
      accessToken: "secret",
    },
    fetchImpl,
  );

  assert.equal(result, "https://mastodon.social/@meetdanielme/1");
  const upload = requests[1].init?.body;
  assert.ok(upload instanceof FormData);
  assert.equal(upload.get("description"), "A descriptive photo");
  assert.ok(upload.get("file") instanceof Blob);
  const status = requests[2].init?.body;
  assert.ok(status instanceof FormData);
  assert.equal(status.get("status"), "Photo post");
  assert.deepEqual(status.getAll("media_ids[]"), ["attachment-1"]);
});

test("uploads Bluesky images and embeds them in the post record", async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  let uploadIndex = 0;
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    requests.push({ url, init });

    if (url.endsWith("/com.atproto.server.createSession")) {
      return jsonResponse({
        accessJwt: "access-token",
        did: "did:plc:meetdaniel",
      });
    }
    if (url.startsWith("https://cdn.example/")) {
      return new Response(new Uint8Array([1, 2, 3]), {
        headers: { "Content-Type": "image/jpeg" },
      });
    }
    if (url.endsWith("/com.atproto.repo.uploadBlob")) {
      uploadIndex += 1;
      return jsonResponse({
        blob: {
          $type: "blob",
          ref: { $link: `blob-${uploadIndex}` },
          mimeType: "image/jpeg",
          size: 3,
        },
      });
    }
    if (url.endsWith("/com.atproto.repo.createRecord")) {
      return jsonResponse({
        uri: "at://did:plc:meetdaniel/app.bsky.feed.post/post-1",
      });
    }

    throw new Error(`Unexpected request: ${url}`);
  };

  const result = await postToBluesky(
    {
      text: "Two photos",
      media: [
        {
          type: "image",
          src: "https://cdn.example/one.jpg",
          alt: "First photo",
        },
        {
          type: "image",
          src: "https://cdn.example/two.jpg",
          alt: "Second photo",
        },
      ],
      serviceUrl: "https://bsky.social/",
      identifier: "meetdaniel.me",
      password: "app-password",
    },
    fetchImpl,
  );

  assert.equal(result, "https://bsky.app/profile/meetdaniel.me/post/post-1");
  const createRecord = requests.find((request) =>
    request.url.endsWith("/com.atproto.repo.createRecord"),
  );
  const body = JSON.parse(String(createRecord?.init?.body));
  assert.equal(body.record.embed.$type, "app.bsky.embed.images");
  assert.deepEqual(
    body.record.embed.images.map(
      (image: { alt: string; image: { ref: { $link: string } } }) => ({
        alt: image.alt,
        ref: image.image.ref.$link,
      }),
    ),
    [
      { alt: "First photo", ref: "blob-1" },
      { alt: "Second photo", ref: "blob-2" },
    ],
  );
});

test("keeps successful platforms when Threads fails", async () => {
  const result = await crossPostRightNow(
    {
      text: "Independent publishing",
      media: [],
      mastodon: true,
      bluesky: false,
      threads: true,
    },
    {
      mastodon: async () => "https://mastodon.social/@meetdaniel/1",
      threads: async () => {
        throw new Error("token expired");
      },
    },
  );

  assert.equal(result.mastodon, "https://mastodon.social/@meetdaniel/1");
  assert.equal(result.threads, null);
  assert.deepEqual(result.warnings, ["Threads: token expired"]);
});
