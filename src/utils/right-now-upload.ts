import { upload } from "@vercel/blob/client";
import { mediaTypes, validateMedia } from "./right-now-media";

export const isHeicFile = (file: File) =>
  /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

export async function optimiseRightNowImage(file: File): Promise<File> {
  // Web-ready images retain their original bytes, dimensions and animation.
  if (!isHeicFile(file)) return file;
  if (file.size > 30 * 1024 * 1024)
    throw new Error("HEIC photos must be under 30 MB.");
  try {
    // Load the decoder only for HEIC, including browsers without native support.
    const { heicTo } = await import("heic-to");
    const jpeg = await heicTo({
      blob: file,
      type: "image/jpeg",
      quality: 0.95,
    });
    return new File([jpeg], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } catch {
    throw new Error(
      `Could not convert ${file.name}. Your draft is kept; try a full-size JPEG export.`,
    );
  }
}

export async function prepareRightNowUpload(
  data: FormData,
  options: { local?: boolean; onProgress?: (message: string) => void } = {},
  send: typeof upload = upload,
): Promise<FormData> {
  const files = data
    .getAll("media")
    .filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length > 4) throw new Error("Add up to 4 media files.");
  const prepared: File[] = [];
  // Validate/convert every attachment before uploading any of them.
  for (const [index, file] of files.entries()) {
    options.onProgress?.(
      `Preparing attachment ${index + 1} of ${files.length}...`,
    );
    const ready = await optimiseRightNowImage(file);
    validateMedia(ready.type, ready.size);
    prepared.push(ready);
  }
  data.delete("media");
  if (options.local) {
    for (const file of prepared) data.append("media", file);
    return data;
  }
  const id = crypto.randomUUID();
  const paths: string[] = [];
  for (const [index, file] of prepared.entries()) {
    const pathname = `right-now/uploads/${id}/${index}.${mediaTypes[file.type].extension}`;
    const blob = await send(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/right-now/upload/",
      contentType: file.type,
      multipart: file.size > 5 * 1024 * 1024,
      abortSignal: AbortSignal.timeout(5 * 60_000),
      onUploadProgress: ({ percentage }) =>
        options.onProgress?.(
          `Uploading attachment ${index + 1} of ${files.length}: ${Math.round(percentage)}%`,
        ),
    });
    paths.push(blob.pathname);
  }
  // Only metadata goes through the Vercel function; media goes straight to Blob.
  data.set("uploadedMedia", JSON.stringify(paths));
  return data;
}
