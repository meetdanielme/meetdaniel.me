# Threads Cross-Posting Design

## Goal

Add Threads as a complete Right Now syndication target alongside Mastodon and Bluesky. A selected Threads cross-post must preserve the post text and URLs, attach the same uploaded image/video media, and save the resulting public Threads URL in the Right Now entry.

## Architecture

Use the existing server-side Right Now publishing endpoint and the manually generated long-lived `THREADS_ACCESS_TOKEN` plus `THREADS_USER_ID`. Do not add OAuth routes, token storage, a database, or a third-party relay.

Extend `src/utils/social.ts` with a Threads publisher that:

1. Creates a Threads media container for text-only, single-image, single-video, or carousel posts.
2. Uses the public Vercel Blob URLs already produced by the Right Now upload flow.
3. Polls video and carousel containers until Meta reports that they are ready.
4. Publishes the container.
5. Fetches the published media's permalink and returns it for frontmatter storage.

HTTP access will be dependency-injected for deterministic tests without contacting Meta.

## Media and URL Behavior

- Plain URLs stay in the post text so Threads can render them natively.
- Zero attachments creates a `TEXT` post.
- One image creates an `IMAGE` post.
- One video creates a `VIDEO` post.
- Two to four mixed image/video attachments create child containers and a `CAROUSEL` container.
- Alt text is sent for images when the Threads API field supports it.
- The existing four-file Right Now limit remains unchanged.
- Local root-relative media is rejected for Threads because Meta must fetch a public HTTPS URL. The website post still succeeds and reports the Threads failure.

## Failure Handling

Each selected platform publishes independently. A Mastodon, Bluesky, or Threads failure is recorded as a warning instead of aborting the canonical website post or another platform's successful post. The API response returns the warnings and the composer displays them after publication.

The content entry records `null` for a failed or unselected platform. Successfully returned syndication links remain visible beneath the published post.

## UI

- Add a Threads icon toggle beside Mastodon and Bluesky on `/right-now/new/`.
- Enable and preselect it only when both `THREADS_ACCESS_TOKEN` and `THREADS_USER_ID` exist.
- Update the missing-configuration help text to include Threads.
- Add Threads to the `Also posted on` links under published Right Now posts.
- Reuse the existing toggle and syndication-link styling.

## Configuration

Server-only variables:

- `THREADS_ACCESS_TOKEN`
- `THREADS_USER_ID`

Neither variable uses a `PUBLIC_` prefix. App ID, app secret, and redirect URI are unnecessary for this single-account token design.

## Testing

- Unit-test Threads request construction for text, single media, and carousel posts.
- Unit-test processing polling, permalink lookup, and API errors.
- Unit-test independent cross-post failure isolation.
- Run the full project test suite, Astro checks, and production build.
- Render `/right-now/new/` locally with safe placeholder credentials to verify the Threads toggle and console health.
- After deployment, perform a real selected Threads cross-post only with explicit action-time approval because it creates a public post.

## Success Criteria

- Threads is configurable through the two existing environment variables.
- The composer enables the Threads toggle when configured.
- Selected text, URLs, and up to four attachments are sent to Threads.
- A successful Threads permalink is saved and displayed under the published post.
- A Threads outage or bad token does not prevent the website post or other platform attempts.
- Automated tests, Astro checks, build, and rendered UI verification pass before publication to GitHub.
