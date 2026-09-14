import assert from "node:assert/strict";
import test from "node:test";
import {
  isHeicFile,
  optimiseRightNowImage,
  prepareRightNowUpload,
} from "./right-now-upload";
import { isRightNowUploadPath, validateMedia } from "./right-now-media";

test("preserves large JPEG, PNG and animated files byte-for-byte", async () => {
  for (const type of ["image/jpeg", "image/png", "image/webp", "image/gif"]) {
    const file = new File([new Uint8Array(6_000_000)], "photo", { type });
    assert.equal(await optimiseRightNowImage(file), file);
  }
});
test("local uploads retain four full-size photos, order and multiline alt metadata", async () => {
  const data = new FormData();
  data.set("location", "Cork, Ireland");
  data.set(
    "altTexts",
    JSON.stringify(["First\nsecond line", "Two", "Three", "Four"]),
  );
  for (let i = 0; i < 4; i++)
    data.append(
      "media",
      new File([new Uint8Array(6_000_000)], `${i}.jpg`, { type: "image/jpeg" }),
    );
  const result = await prepareRightNowUpload(data, { local: true });
  assert.equal(result.get("location"), "Cork, Ireland");
  assert.deepEqual(JSON.parse(String(result.get("altTexts"))), [
    "First\nsecond line",
    "Two",
    "Three",
    "Four",
  ]);
  assert.deepEqual(
    result.getAll("media").map((f) => [(f as File).name, (f as File).size]),
    [0, 1, 2, 3].map((i) => [`${i}.jpg`, 6_000_000]),
  );
});
test("recognises HEIC even when the browser supplies an empty MIME type", () => {
  assert.ok(isHeicFile(new File(["test"], "IMG_6228.HEIC")));
  assert.ok(isHeicFile(new File(["test"], "photo", { type: "image/heif" })));
});
test("rejects foreign paths, traversal, unsupported types, and oversized files", () => {
  assert.ok(
    isRightNowUploadPath(
      "right-now/uploads/12345678-1234-1234-1234-123456789012/0.jpg",
    ),
  );
  for (const path of [
    "https://evil.example/photo.jpg",
    "../photo.jpg",
    "right-now/uploads/../../0.jpg",
  ])
    assert.equal(isRightNowUploadPath(path), false);
  assert.throws(() => validateMedia("image/svg+xml", 100));
  assert.throws(() => validateMedia("image/jpeg", 31 * 1024 * 1024));
});

test("direct uploads send full files to Blob and only ordered references to publishing", async () => {
  const data = new FormData();
  data.set("location", "Cork, Ireland");
  data.set("altTexts", JSON.stringify(["One\nsecond line", "Two"]));
  for (let i = 0; i < 2; i++)
    data.append(
      "media",
      new File([new Uint8Array(6_000_000)], `${i}.jpg`, { type: "image/jpeg" }),
    );
  const sent: number[] = [];
  const result = await prepareRightNowUpload(
    data,
    {},
    async (pathname, body, options) => {
      sent.push((body as File).size);
      assert.equal(options.multipart, true);
      assert.equal(options.handleUploadUrl, "/api/right-now/upload/");
      return {
        pathname,
        url: `https://example.com/${pathname}`,
        downloadUrl: `https://example.com/${pathname}`,
        contentType: "image/jpeg",
        contentDisposition: "inline",
      };
    },
  );
  assert.deepEqual(sent, [6_000_000, 6_000_000]);
  assert.equal(result.getAll("media").length, 0);
  const paths = JSON.parse(String(result.get("uploadedMedia")));
  assert.equal(paths.length, 2);
  assert.ok(paths[0].endsWith("/0.jpg") && paths[1].endsWith("/1.jpg"));
  assert.equal(result.get("location"), "Cork, Ireland");
  assert.equal(
    JSON.parse(String(result.get("altTexts")))[0],
    "One\nsecond line",
  );
  assert.ok((await new Response(result).blob()).size < 2000);
});
