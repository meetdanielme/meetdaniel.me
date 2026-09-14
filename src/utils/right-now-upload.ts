// Leave room below Vercel's 4.5 MB request limit, including multipart metadata.
export const RIGHT_NOW_UPLOAD_BUDGET = 4_000_000;
const imageBudget = 900_000;

export async function optimiseRightNowImage(file: File): Promise<File> {
  // Preserve animated GIFs and videos rather than flattening them.
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(
      `Could not read ${file.name}. Try exporting it as a JPEG or PNG.`,
    );
  }
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("Image optimisation is unavailable in this browser.");
    let edge = Math.min(2048, Math.max(bitmap.width, bitmap.height));
    for (let attempt = 0; attempt < 6; attempt++) {
      const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (value) =>
            value
              ? resolve(value)
              : reject(new Error(`Could not optimise ${file.name}.`)),
          "image/webp",
          0.82,
        );
      });
      if (blob.size <= imageBudget) {
        // Retain an already smaller original, including its original encoding.
        if (file.size <= blob.size) return file;
        const extension = blob.type === "image/webp" ? "webp" : "png";
        return new File(
          [blob],
          `${file.name.replace(/\.[^.]+$/, "")}.${extension}`,
          {
            type: blob.type,
            lastModified: file.lastModified,
          },
        );
      }
      edge *= 0.75;
    }
    if (file.size <= imageBudget) return file;
    throw new Error(
      `Could not make ${file.name} small enough. Try a smaller image.`,
    );
  } finally {
    bitmap.close();
  }
}

export async function prepareRightNowUpload(data: FormData): Promise<FormData> {
  const files = data
    .getAll("media")
    .filter((value): value is File => value instanceof File && value.size > 0);
  data.delete("media");
  // Process sequentially to avoid decoding several large photos at once.
  for (const file of files)
    data.append("media", await optimiseRightNowImage(file));
  const bytes = (await new Response(data).blob()).size;
  if (bytes > RIGHT_NOW_UPLOAD_BUDGET) {
    throw new Error(
      "Attachments are still too large to upload together. Use a smaller video or GIF, or remove an attachment. Your draft has been kept.",
    );
  }
  return data;
}
