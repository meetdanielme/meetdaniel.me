import type { APIContext } from "astro";
import {
  clearRightNowSession,
  getPostingSecret,
  setRightNowSession,
} from "../../../utils/right-now-auth";

export const prerender = false;

const redirectToForm = (context: APIContext, search = "") =>
  context.redirect(`/right-now/new/${search}`, 303);

export async function POST(context: APIContext) {
  const formData = await context.request.formData();
  const action = formData.get("action");

  if (action === "logout") {
    clearRightNowSession(context);
    return redirectToForm(context);
  }

  const expectedSecret = getPostingSecret();
  const submittedSecret = formData.get("secret");

  if (
    !expectedSecret ||
    typeof submittedSecret !== "string" ||
    submittedSecret !== expectedSecret
  ) {
    return redirectToForm(context, "?error=1");
  }

  await setRightNowSession(context, expectedSecret);
  return redirectToForm(context);
}
