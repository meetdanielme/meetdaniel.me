import assert from "node:assert/strict";
import test from "node:test";
import { buildRightNowPostMarkdown } from "./right-now-markdown";

test("stores a successful Threads syndication URL", () => {
  const markdown = buildRightNowPostMarkdown({
    text: "Hello Threads",
    createdAt: "2026-07-10T12:00:00.000Z",
    location: "",
    media: [],
    links: [],
    syndication: {
      mastodon: null,
      bluesky: null,
      threads: "https://www.threads.net/@meetdaniel.me/post/example",
    },
  });

  assert.match(
    markdown,
    /syndication:\n  mastodon: null\n  bluesky: null\n  threads: "https:\/\/www\.threads\.net\/@meetdaniel\.me\/post\/example"/,
  );
});
