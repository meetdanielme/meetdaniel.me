# Threads Cross-Posting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add resilient Threads cross-posting with text, URLs, image/video media, stored permalinks, and composer/post UI parity.

**Architecture:** Extend the existing server-side social publisher with an injected-fetch Threads client that creates and publishes Meta media containers. Pass uploaded public media into independently isolated platform attempts, persist successful URLs in frontmatter, and reuse the existing Astro controls and syndication link UI.

**Tech Stack:** Astro 7, TypeScript, Node test runner through `tsx`, Threads Graph API, Vercel Blob.

## Global Constraints

- Keep the existing four-attachment limit.
- Use only server-side `THREADS_ACCESS_TOKEN` and `THREADS_USER_ID` variables.
- Do not add OAuth, hosted services, or runtime dependencies.
- A platform failure must not block the website post or another platform attempt.
- Follow test-driven development: observe every behavior test fail before implementation.

---

### Task 1: Threads publisher and isolated cross-post orchestration

**Files:**

- Modify: `package.json`
- Modify: `src/utils/social.ts`
- Modify: `src/utils/social.test.ts`

**Interfaces:**

- Consumes: `text: string`, `media: Array<{ type: "image" | "video"; src: string; alt?: string }>` and platform booleans.
- Produces: `crossPostRightNow(options, fetchImpl?) => Promise<{ mastodon?: string | null; bluesky?: string | null; threads?: string | null; warnings: string[] }>`.

- [ ] **Step 1: Write failing Threads request tests**

Add tests that inject a recording `fetch` implementation and assert:

```ts
assert.equal(createBody.get("media_type"), "TEXT");
assert.equal(createBody.get("text"), "A URL https://meetdaniel.me/");
assert.equal(
  result.threads,
  "https://www.threads.net/@meetdaniel.me/post/example",
);
```

Add single-image and mixed carousel cases that assert `image_url`, `video_url`, `is_carousel_item`, and comma-separated `children` request fields.

- [ ] **Step 2: Run tests and verify RED**

Run: `pnpm exec tsx --test src/utils/social.test.ts`

Expected: FAIL because Threads options and result behavior are not implemented.

- [ ] **Step 3: Implement minimal Threads client**

Add:

```ts
type CrossPostMedia = {
  type: "image" | "video";
  src: string;
  alt?: string;
};

const threadsApiUrl = "https://graph.threads.net/v1.0";
```

Implement container creation, bounded status polling, publishing, and permalink lookup using `URLSearchParams`, bearer authorization, and the injected fetch function. Validate all media URLs as public HTTPS URLs before sending them to Meta.

- [ ] **Step 4: Add failing failure-isolation test**

Stub Threads to return an API error while Mastodon returns a URL. Assert the result keeps the Mastodon URL, sets Threads to `null`, and includes a `Threads: ...` warning.

- [ ] **Step 5: Run the isolation test and verify RED**

Run: `pnpm exec tsx --test src/utils/social.test.ts`

Expected: FAIL because the current orchestrator throws on a platform failure.

- [ ] **Step 6: Implement independent platform attempts**

Wrap each selected publisher in a named attempt that catches its error, records a warning, and continues. Return `warnings` with successful syndication URLs.

- [ ] **Step 7: Run tests and verify GREEN**

Run: `pnpm exec tsx --test src/utils/social.test.ts`

Expected: all social publisher tests pass.

### Task 2: Persist Threads results and warnings

**Files:**

- Modify: `src/pages/api/right-now/create.ts`
- Modify: `src/content.config.ts`

**Interfaces:**

- Consumes: uploaded public media and `crosspostThreads` form value.
- Produces: frontmatter `syndication.threads`, JSON `warnings`, and a success message that distinguishes partial syndication failures.

- [ ] **Step 1: Write failing frontmatter/result tests**

Export or move the pure frontmatter builder as needed, then assert generated Markdown contains:

```yaml
syndication:
  mastodon: null
  bluesky: null
  threads: "https://www.threads.net/@meetdaniel.me/post/example"
```

Assert warnings are returned without changing `ok: true` for a successful canonical post.

- [ ] **Step 2: Run tests and verify RED**

Run: `pnpm exec tsx --test src/**/*.test.ts`

Expected: FAIL because Threads is hard-coded to `null` and warnings are absent.

- [ ] **Step 3: Wire media, selection, permalink, and warnings**

Read `crosspostThreads`, pass normalized uploaded media to `crossPostRightNow`, persist `syndication.threads`, and return the warning array. Keep the existing schema's nullable Threads URL.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `pnpm exec tsx --test src/**/*.test.ts`

Expected: all tests pass.

### Task 3: Composer toggle and published Threads link

**Files:**

- Modify: `src/pages/right-now/new.astro`
- Modify: `src/components/RightNowPost.astro`

**Interfaces:**

- Consumes: `THREADS_ACCESS_TOKEN`, `THREADS_USER_ID`, and stored `post.data.syndication.threads`.
- Produces: checkbox `crosspostThreads`, warning-aware submission status, and a Threads link in `Also posted on`.

- [ ] **Step 1: Add Threads configuration and toggle markup**

Compute:

```ts
const isThreadsConfigured = Boolean(
  import.meta.env.THREADS_ACCESS_TOKEN && import.meta.env.THREADS_USER_ID,
);
```

Add a checked/enabled `ri-threads-fill` toggle named `crosspostThreads`, include Threads in `isCrossPostingConfigured`, and make missing-configuration copy platform-neutral.

- [ ] **Step 2: Display partial-success warnings**

After a successful API response, append `warnings.join(" ")` to the composer status so the canonical success and platform failure are both visible.

- [ ] **Step 3: Add the published Threads syndication link**

Append `{ href: post.data.syndication.threads, label: "Threads", icon: "ri-threads-fill" }` to `syndicationLinks`.

- [ ] **Step 4: Run Astro checks**

Run: `pnpm exec astro check`

Expected: zero errors.

### Task 4: Full verification and publication

**Files:**

- Verify all modified files.

- [ ] **Step 1: Run complete automated verification**

Run:

```sh
pnpm exec tsx --test src/**/*.test.ts
pnpm exec astro check
pnpm run build
```

Expected: all tests pass, Astro reports zero errors, and build exits 0.

- [ ] **Step 2: Render and inspect `/right-now/new/`**

Start the dev server with safe placeholder Threads variables, authenticate using the existing local posting secret, and verify the Threads toggle is enabled, checked, labeled, styled consistently, and produces no relevant console error.

- [ ] **Step 3: Review the diff and repository state**

Run: `git diff --check`, `git diff --stat`, and `git status --short`. Confirm no generated output or secrets are staged.

- [ ] **Step 4: Commit, push, and merge**

Commit the implementation, push `main` to `origin`, and verify local `HEAD`, `origin/main`, and the GitHub default branch resolve to the same commit. Since work begins on an already clean `main`, the push is the merge into the default branch.

- [ ] **Step 5: Verify the deployed UI**

Wait for the Vercel production deployment, inspect `/right-now/new/`, and verify the configured Threads toggle appears. Do not create a public test post without separate action-time confirmation.
