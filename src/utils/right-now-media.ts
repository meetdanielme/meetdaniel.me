export const mediaTypes: Record<
  string,
  { type: "image" | "video"; extension: string; maxSize: number }
> = {
  "image/jpeg": { type: "image", extension: "jpg", maxSize: 30 * 1024 * 1024 },
  "image/png": { type: "image", extension: "png", maxSize: 30 * 1024 * 1024 },
  "image/webp": { type: "image", extension: "webp", maxSize: 30 * 1024 * 1024 },
  "image/gif": { type: "image", extension: "gif", maxSize: 30 * 1024 * 1024 },
  "video/mp4": { type: "video", extension: "mp4", maxSize: 100 * 1024 * 1024 },
  "video/quicktime": {
    type: "video",
    extension: "mov",
    maxSize: 100 * 1024 * 1024,
  },
  "video/webm": {
    type: "video",
    extension: "webm",
    maxSize: 100 * 1024 * 1024,
  },
};
export const isRightNowUploadPath = (path: string) =>
  /^right-now\/uploads\/[0-9a-f-]{36}\/[0-3]\.(jpg|png|webp|gif|mp4|mov|webm)$/.test(
    path,
  );
export function validateMedia(type: string, size: number) {
  const spec = mediaTypes[type];
  if (!spec)
    throw new Error(
      "Unsupported media format. Use JPEG, PNG, WebP, GIF, HEIC, MP4, MOV or WebM.",
    );
  if (!Number.isFinite(size) || size <= 0 || size > spec.maxSize)
    throw new Error(
      `This ${spec.type} exceeds the ${spec.maxSize / 1024 / 1024} MB upload limit.`,
    );
  return spec;
}
