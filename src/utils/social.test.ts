import assert from "node:assert/strict";
import test from "node:test";
import { buildBlueskyLinkFacets } from "./social";

test("builds UTF-8 byte ranges for Bluesky links", () => {
  const text = "Hello 👋 https://example.com/one and https://example.org/two";

  assert.deepEqual(buildBlueskyLinkFacets(text), [
    {
      index: { byteStart: 11, byteEnd: 34 },
      features: [
        {
          "$type": "app.bsky.richtext.facet#link",
          uri: "https://example.com/one",
        },
      ],
    },
    {
      index: { byteStart: 39, byteEnd: 62 },
      features: [
        {
          "$type": "app.bsky.richtext.facet#link",
          uri: "https://example.org/two",
        },
      ],
    },
  ]);
});
