import type { APIContext } from "astro";

const cookieName = "right_now_session";
const encoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const constantTimeEqual = (left: string, right: string) => {
  if (left.length !== right.length) return false;

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return result === 0;
};

export const getPostingSecret = () => import.meta.env.RIGHT_NOW_POSTING_SECRET;

export const getSessionToken = async (secret: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode("meetdaniel.me/right-now"),
  );

  return toHex(signature);
};

export const hasValidRightNowSession = async (
  cookies: APIContext["cookies"],
) => {
  const secret = getPostingSecret();
  const session = cookies.get(cookieName)?.value;

  if (!secret || !session) return false;

  return constantTimeEqual(session, await getSessionToken(secret));
};

export const setRightNowSession = async (context: APIContext, secret: string) => {
  context.cookies.set(cookieName, await getSessionToken(secret), {
    httpOnly: true,
    sameSite: "strict",
    secure: import.meta.env.PROD,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
};

export const clearRightNowSession = (context: APIContext) => {
  context.cookies.delete(cookieName, {
    path: "/",
  });
};
