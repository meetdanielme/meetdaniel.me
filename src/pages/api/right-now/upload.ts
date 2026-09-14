import type { APIContext } from "astro";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { hasValidRightNowSession } from "../../../utils/right-now-auth";
import {
  isRightNowUploadPath,
  mediaTypes,
} from "../../../utils/right-now-media";
export const prerender = false;
export async function POST(context: APIContext) {
  try {
    const body = (await context.request.json()) as HandleUploadBody;
    // Completion callbacks are verified by the SDK, without a browser cookie.
    if (
      body.type !== "blob.upload-completed" &&
      !(await hasValidRightNowSession(context.cookies))
    ) {
      return Response.json({ error: "Not authorised." }, { status: 401 });
    }
    const result = await handleUpload({
      request: context.request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!isRightNowUploadPath(pathname))
          throw new Error("Invalid upload path.");
        const extension = pathname.split(".").pop();
        const entry = Object.entries(mediaTypes).find(
          ([, value]) => value.extension === extension,
        )!;
        return {
          allowedContentTypes: [entry[0]],
          maximumSizeInBytes: entry[1].maxSize,
          addRandomSuffix: false,
          allowOverwrite: false,
          validUntil: Date.now() + 10 * 60_000,
        };
      },
    });
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 },
    );
  }
}
