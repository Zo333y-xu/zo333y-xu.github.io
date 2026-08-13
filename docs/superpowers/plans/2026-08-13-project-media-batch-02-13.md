# Project Media Batch 02–13 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish verified covers and browser-ready MP4 files for eight existing projects without changing catalog order, categories, or page layout.

**Architecture:** Treat the supplied `S:` drive directories as immutable input, normalize their media into repository assets, and connect those paths through the existing catalog generator. Generated pages remain the build output; the existing player, fallback, homepage cover, Projects grid, and recommendation systems remain unchanged.

**Tech Stack:** CommonJS/Node.js 20+, Node test runner, static HTML/CSS/JavaScript, FFmpeg Media Foundation H.264/AAC, Playwright with installed Chrome.

## Global Constraints

- Never modify or delete source ZIP files or extracted source directories.
- Public pages continue to omit Chinese titles and project descriptions.
- Preserve the existing 23-project catalog, ten-item featured order, Type, Service, and recommendation algorithm.
- Covers are not destructively cropped; homepage and Projects containers use centered `object-fit: cover`.
- Output video is H.264/AAC MP4, `yuv420p`, fast-start, source aspect ratio/frame rate, maximum 1920×1080, no upscaling.
- Every committed video must be below 100 MB and should be below 50 MB.
- Universal uses the accepted 645×429 supplied cover without synthetic enhancement.

---

### Task 1: Verify and normalize the eight media pairs

**Files:**
- Create: `assets/images/huawei-freebuds-pro-3-cover.png`
- Create: `assets/images/huawei-nora-band-10-cover.png`
- Create: `assets/images/universal-studio-cover.jpg`
- Create: `assets/images/huawei-watch-fit-5-niki-cover.png`
- Create: `assets/images/anta-milan-cover.png`
- Create: `assets/images/honor-x-fifa-cover.png`
- Create: `assets/images/lays-cny-campaign-cover.png`
- Create: `assets/images/touareg-x-wu-jing-cover.png`
- Create: matching `.mp4` files under `assets/videos/`
- Test: `tests/project-build.test.js`

**Interfaces:**
- Consumes: one image and one video from each numbered `S:\Project\Users\May\网站片子\812\<project>` directory.
- Produces: repository-local poster paths under `assets/images/` and MP4 paths under `assets/videos/`.

- [ ] **Step 1: Add the failing catalog media expectations**

Extend `expectedMedia` in `tests/project-build.test.js` with:

```js
"huawei-freebuds-pro-3": ["assets/images/huawei-freebuds-pro-3-cover.png", "assets/videos/huawei-freebuds-pro-3.mp4"],
"huawei-nora-band-10": ["assets/images/huawei-nora-band-10-cover.png", "assets/videos/huawei-nora-band-10.mp4"],
"universal-studio": ["assets/images/universal-studio-cover.jpg", "assets/videos/universal-studio.mp4"],
"huawei-watch-fit-5-niki": ["assets/images/huawei-watch-fit-5-niki-cover.png", "assets/videos/huawei-watch-fit-5-niki.mp4"],
"anta-milan": ["assets/images/anta-milan-cover.png", "assets/videos/anta-milan.mp4"],
"honor-x-fifa": ["assets/images/honor-x-fifa-cover.png", "assets/videos/honor-x-fifa.mp4"],
"lays-cny-campaign": ["assets/images/lays-cny-campaign-cover.png", "assets/videos/lays-cny-campaign.mp4"],
"touareg-x-wu-jing": ["assets/images/touareg-x-wu-jing-cover.png", "assets/videos/touareg-x-wu-jing.mp4"],
```

- [ ] **Step 2: Run the focused test and observe the expected failure**

Run:

```powershell
& $node tests/project-build.test.js
```

Expected: failure because the eight catalog records still reference placeholders and `null` videos.

- [ ] **Step 3: Copy the eight supplied covers without modifying the sources**

Use `Copy-Item -LiteralPath` from each extracted project directory to the exact normalized image path above. Confirm byte sizes are non-zero and use `System.Drawing.Image` to verify the expected supplied dimensions, including Universal at 645×429.

- [ ] **Step 4: Inspect source streams and calculate target bitrate**

Use the available FFmpeg binary:

```powershell
$ffmpeg = 'C:\Program Files (x86)\ACLOS\Cross\recorder-release\ffmpeg.exe'
```

For each source, inspect codec, resolution, frame rate, duration, and audio presence. Calculate a video bitrate that keeps `(video bitrate + audio bitrate) × duration / 8` below 48,000,000 bytes. Use 128 kbps AAC for sources with audio, with a practical video ceiling of 5 Mbps.

- [ ] **Step 5: Encode sources that are not already compliant**

Use this command shape, replacing input, output, and computed bitrate:

```powershell
& $ffmpeg -y -i $source -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease,format=yuv420p" -c:v h264_mf -b:v $videoBitrate -maxrate $maxRate -bufsize $bufferSize -c:a aac -b:a 128k -movflags +faststart $output
```

If a compliant source is copied rather than encoded, browser metadata must still prove H.264 MP4 compatibility and fast playback. Re-encode any output at or above 50 MB with a reduced bitrate; reject any output at or above 100 MB.

- [ ] **Step 6: Validate all normalized media**

Check that all eight covers and videos exist and are non-empty. Validate every output with browser metadata later in Task 3; remove no source files.

---

### Task 2: Connect the media to the catalog and regenerate pages

**Files:**
- Modify: `data/projects.cjs`
- Modify: `index.html`
- Modify: `projects.html`
- Modify: `projects/*/index.html`
- Test: `tests/project-build.test.js`
- Test: `tests/home-navigation.test.js`

**Interfaces:**
- Consumes: exact local asset paths produced by Task 1.
- Produces: eight catalog entries with non-placeholder `poster` and non-null `video`, plus rebuilt static pages.

- [ ] **Step 1: Add poster and video arguments to each matching project record**

For example:

```js
project({
  slug: "huawei-freebuds-pro-3",
  // existing metadata remains byte-for-byte equivalent
  poster: "assets/images/huawei-freebuds-pro-3-cover.png",
  video: "assets/videos/huawei-freebuds-pro-3.mp4",
})
```

Apply the corresponding paths from Task 1 to all eight slugs. Do not change any other metadata.

- [ ] **Step 2: Run the focused catalog tests**

Run:

```powershell
& $node tests/project-build.test.js
```

Expected: the eight new mapping expectations pass.

- [ ] **Step 3: Rebuild all static pages**

Run:

```powershell
& $node scripts/build.cjs
```

Expected: exit code 0, 23 project detail directories retained, homepage contains ten featured panels, and supplied images replace the corresponding placeholders.

- [ ] **Step 4: Run the complete automated suite**

Run:

```powershell
& $node --test tests/*.test.js
```

Expected: all tests pass with zero failures.

---

### Task 3: Perform asset and browser acceptance checks

**Files:**
- Create ignored diagnostic scripts under `.superpowers/incoming/` only when needed.
- Modify production files only if a failing acceptance check proves a defect; add a failing test before that fix.

**Interfaces:**
- Consumes: rebuilt static site and all normalized assets.
- Produces: evidence that every cover and player works at desktop and mobile viewport sizes.

- [ ] **Step 1: Scan generated local asset references**

Parse the 25 generated HTML files and verify every repository-local `src`, `href` asset, poster, and `data-video-src` target exists and is non-empty. Expected: zero missing assets.

- [ ] **Step 2: Start the local preview server**

Run Python HTTP server on `127.0.0.1:8765` from the worktree, reusing the existing server only if it serves the current worktree.

- [ ] **Step 3: Verify the four featured covers at both viewports**

At 1440×900 and 390×844, visit the homepage with the intro session marker set. Check featured projects among the batch (`huawei-freebuds-pro-3`, `huawei-nora-band-10`, `universal-studio`, `huawei-watch-fit-5-niki`) plus any other batch item that is featured in current data. For each, assert the image loads, panel equals the viewport, and computed `object-fit` is `cover`.

- [ ] **Step 4: Verify all eight Projects cards**

At desktop and mobile sizes, visit `projects.html`; assert all eight images load, cards share the current equal aspect ratio, the grid is two columns on desktop and one on mobile, and no horizontal overflow occurs.

- [ ] **Step 5: Verify all eight detail players**

For each slug, open the detail route, click the player, wait for `loadedmetadata`, and record `videoWidth`, `videoHeight`, `duration`, `readyState`, `currentSrc`, and poster. Expected: positive dimensions/duration, local MP4 URL, correct local poster, zero page errors, and zero relevant HTTP errors.

- [ ] **Step 6: Re-run complete build and test verification**

Run the build, all Node tests, `git diff --check`, asset scan, file-size scan, and browser checks again after any acceptance-driven fixes.

---

### Task 4: Commit and publish the verified batch

**Files:**
- Stage only the eight covers, eight videos, catalog/test changes, generated HTML, and this plan/spec documentation.

**Interfaces:**
- Consumes: verified clean implementation from Tasks 1–3.
- Produces: updated `codex/project-catalog` branch and Draft PR #3.

- [ ] **Step 1: Review staged scope and large-file constraints**

Run `git status --short`, `git diff --stat`, `git diff --check`, and list every new video byte size. Confirm no ignored source extracts or diagnostics are staged.

- [ ] **Step 2: Commit the media batch**

```powershell
git commit -m "feat: add next project media batch"
```

- [ ] **Step 3: Push the existing feature branch**

```powershell
git push origin codex/project-catalog
```

Expected: remote head equals local head and Draft PR #3 updates without creating a second PR.
