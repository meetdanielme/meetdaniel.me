import { defineMiddleware } from "astro:middleware";
import { RIGHT_NOW_ENABLED } from "./utils/site-features";

export const onRequest = defineMiddleware((context, next) => {
  if (!RIGHT_NOW_ENABLED) {
    const pathname = context.url.pathname;
    if (pathname === "/right-now" || pathname.startsWith("/right-now/")) {
      return context.redirect("/", 302);
    }
    if (pathname === "/api/right-now" || pathname.startsWith("/api/right-now/")) {
      return new Response(null, { status: 404 });
    }
  }
  return next();
});
