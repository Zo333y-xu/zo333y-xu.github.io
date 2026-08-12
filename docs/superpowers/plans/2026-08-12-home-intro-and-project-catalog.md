# Home Intro and Project Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a session-once intro animation and generate the home page, Projects page, and 23 project detail pages from one validated catalog, with safe placeholder media fallbacks.

**Architecture:** Extend `data/projects.cjs` into the single project catalog and keep `scripts/project-build.cjs` as a pure static HTML renderer plus filesystem build orchestrator. Put intro lifecycle behavior in a small testable CommonJS module that also initializes itself in the browser, while `assets/site.js` retains reveal and filtering behavior. Generate all site pages at build time so local-file use and SEO remain intact.

**Tech Stack:** Node.js 20+, CommonJS, `node:test`, static HTML/CSS/JavaScript, sessionStorage, native HTML video.

## Global Constraints

- The catalog must contain exactly 23 projects and exactly 10 unique `featuredOrder` values covering integers 1 through 10.
- The intro source is `D:/xwechat_files/wxid_mo3c9nf8jys422_6f51/msg/video/2026-08/b891f7949b42d0d7c7d76e621006ce1c.mp4` and the published destination is `assets/videos/site-intro.mp4`.
- Service labels are exactly `AIGC`, `CG & VFX`, `2D Animation`, and `Online`, in that display order.
- Type labels are exactly `3C & Tech`, `Automotive`, `FMCG`, `Beauty & Fashion`, and `Short Film`.
- Missing posters use `assets/images/project-placeholder.svg`; missing videos use `video: null` and render `Video coming soon` without an empty `<video>` source.
- New Xinpianchang URLs remain ordinary `sourceUrl` links and are never embedded as video sources.
- Preserve unrelated user changes in the dirty worktree.

---

### Task 1: Catalog schema and 23 project records

**Files:**
- Modify: `tests/project-build.test.js`
- Modify: `data/projects.cjs`
- Modify: `scripts/project-build.cjs`
- Create: `assets/images/project-placeholder.svg`

**Interfaces:**
- Consumes: Excel rows already captured in the approved design specification.
- Produces: `projects: Project[]`, where every record has `slug`, `title`, `titleZh`, `client`, `year`, `background`, `poster`, `video`, `sourceUrl`, `imageAlt`, `type`, `services`, `search`, `featuredOrder`, and `recommendedProjects`.

- [ ] **Step 1: Write failing catalog validation tests**

Add tests that assert the actual catalog has 23 records, uses unique slugs, contains exactly ten `featuredOrder` values `1..10`, uses only approved Type and Service values, stores `services` as a non-empty array of at most three unique values, and contains no legacy strings:

```js
test("catalog contains 23 valid projects and ten ordered features", () => {
  assert.equal(projects.length, 23);
  assert.deepEqual(
    projects.filter((project) => project.featuredOrder != null)
      .map((project) => project.featuredOrder).sort((a, b) => a - b),
    [1,2,3,4,5,6,7,8,9,10],
  );
  assert.doesNotThrow(() => validateProjects(projects));
});

test("catalog uses canonical service labels", () => {
  const allowed = new Set(["AIGC", "CG & VFX", "2D Animation", "Online"]);
  for (const project of projects) {
    assert.ok(Array.isArray(project.services));
    assert.ok(project.services.length >= 1 && project.services.length <= 3);
    assert.equal(new Set(project.services).size, project.services.length);
    project.services.forEach((service) => assert.ok(allowed.has(service), service));
  }
  assert.doesNotMatch(JSON.stringify(projects), /AI-Generated|CG&VFX/);
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```powershell
node --test tests/project-build.test.js
```

Expected: FAIL because the catalog has six records, uses `service` strings, and lacks the new fields and feature-order validation.

- [ ] **Step 3: Add validation for the new schema**

Replace the old required-field list and extend `validateProjects` to validate nullable media, approved labels, unique service values, and featured ordering. Use constants exported from `scripts/project-build.cjs`:

```js
const TYPE_VALUES = ["3C & Tech", "Automotive", "FMCG", "Beauty & Fashion", "Short Film"];
const SERVICE_VALUES = ["AIGC", "CG & VFX", "2D Animation", "Online"];
```

Treat `client`, `video`, `sourceUrl`, and `featuredOrder` as explicitly nullable/empty-capable fields; require every other schema field.

- [ ] **Step 4: Populate all 23 project records**

Translate Excel rows 2–24 into 23 catalog records. Exclude the intro animation row from the project count. Map the showreel to `featuredOrder: 1`, preserve rows 3–10 in order, and assign `HUAWEI WATCH Fit 5 Niki` to `featuredOrder: 10`. Use the placeholder SVG and `video: null` whenever no verified local asset exists.

- [ ] **Step 5: Create the local placeholder SVG**

Create a 16:9 SVG with a restrained off-white background, black `WHITE PIX` wordmark, and `PROJECT PREVIEW` secondary line. It must remain legible under both full-screen `object-fit: cover` and two-column card cropping.

- [ ] **Step 6: Run the focused tests and verify GREEN**

Run:

```powershell
node --test tests/project-build.test.js
```

Expected: all catalog and existing renderer tests pass after updating old fixtures from `service` to `services`.

- [ ] **Step 7: Commit the catalog unit**

```powershell
git add data/projects.cjs scripts/project-build.cjs tests/project-build.test.js assets/images/project-placeholder.svg
git commit -m "feat: add complete project catalog"
```

### Task 2: Generate the ten-project home page

**Files:**
- Modify: `tests/home-navigation.test.js`
- Modify: `tests/project-build.test.js`
- Modify: `scripts/project-build.cjs`
- Modify: `index.html` (generated)

**Interfaces:**
- Consumes: validated catalog records and `featuredOrder` from Task 1.
- Produces: `selectFeaturedProjects(projects) -> Project[]`, `renderHomeProject(project) -> string`, and `renderHomePage(projects) -> string`.

- [ ] **Step 1: Write failing home-render tests**

Add tests that require ten sorted home panels and direct detail links:

```js
test("home page renders ten ordered projects with direct detail links", () => {
  const html = renderHomePage(projects);
  assert.equal((html.match(/class="work-panel reveal"/g) || []).length, 10);
  const ordered = selectFeaturedProjects(projects);
  ordered.forEach((project) => {
    assert.match(html, new RegExp(`href="projects/${project.slug}/"`));
  });
  assert.doesNotMatch(html, /class="work-panel reveal" href="projects\.html"/);
});
```

Update `tests/home-navigation.test.js` to expect ten `work-panel` anchors and no hard-coded `home-project-02.jpg` dependency.

- [ ] **Step 2: Run tests and verify RED**

Run:

```powershell
node --test tests/home-navigation.test.js tests/project-build.test.js
```

Expected: FAIL because `renderHomePage` and `selectFeaturedProjects` do not exist and `index.html` is hard-coded.

- [ ] **Step 3: Implement featured selection and home rendering**

Implement `selectFeaturedProjects` by filtering non-null `featuredOrder`, sorting numerically, and verifying a complete 1–10 sequence. Implement each panel as:

```html
<a class="work-panel reveal" href="projects/<slug>/" aria-label="Open <title>">
  <img src="<poster>" alt="<imageAlt>" loading="lazy">
</a>
```

Omit `loading="lazy"` from the first featured image.

- [ ] **Step 4: Make the build write `index.html`**

In `buildSite`, write `renderHomePage(projects)` before `projects.html`, then keep detail generation unchanged.

- [ ] **Step 5: Build and verify GREEN**

Run:

```powershell
node scripts/build.cjs
node --test tests/home-navigation.test.js tests/project-build.test.js
```

Expected: generated `index.html` contains ten direct detail links and all focused tests pass.

- [ ] **Step 6: Commit the home generator**

```powershell
git add scripts/project-build.cjs tests/home-navigation.test.js tests/project-build.test.js index.html
git commit -m "feat: generate featured home projects"
```

### Task 3: Intro animation lifecycle

**Files:**
- Create: `tests/intro-gate.test.js`
- Create: `assets/intro-gate.js`
- Modify: `scripts/project-build.cjs`
- Modify: `index.html` (generated)
- Copy: `assets/videos/site-intro.mp4`

**Interfaces:**
- Consumes: DOM-like dependencies passed to `createIntroGate` and the generated `[data-intro]` markup.
- Produces: `createIntroGate({ root, video, skipButton, storage, mediaQuery, setTimer, clearTimer, timeoutMs }) -> { start, finish }` and browser auto-initialization.

- [ ] **Step 1: Write failing unit tests for the gate**

Use small event-target fakes rather than a browser dependency. Cover:

```js
test("finish is idempotent and stores the session marker", () => { /* ended then skip removes once */ });
test("skip finishes the intro", () => { /* dispatch click */ });
test("video error finishes the intro", () => { /* dispatch error */ });
test("rejected autoplay finishes the intro", async () => { /* play returns rejected promise */ });
test("timeout finishes the intro", () => { /* invoke captured timer callback */ });
test("an existing session marker skips playback", () => { /* play call count stays zero */ });
test("reduced motion skips playback", () => { /* mediaQuery.matches is true */ });
test("storage exceptions do not block the page", () => { /* getItem/setItem throw */ });
```

- [ ] **Step 2: Run the intro test and verify RED**

Run:

```powershell
node --test tests/intro-gate.test.js
```

Expected: FAIL because `assets/intro-gate.js` does not exist.

- [ ] **Step 3: Implement the minimal intro state machine**

Use one `finished` boolean, safe storage wrappers, event listeners for `ended`, `error`, and Skip, and a 12-second safety timeout. `finish()` must clear the timeout, set the marker, add `is-finished`, remove the body lock, and remove the intro node after its transition.

Export through CommonJS when `module.exports` exists and auto-initialize on `DOMContentLoaded` in browsers.

- [ ] **Step 4: Add intro markup to `renderHomePage`**

Generate an intro layer before the header:

```html
<section class="site-intro" data-intro aria-label="White Pix introduction">
  <video data-intro-video src="assets/videos/site-intro.mp4" muted autoplay playsinline preload="auto"></video>
  <button type="button" class="site-intro-skip" data-intro-skip>Skip</button>
</section>
```

Load `assets/intro-gate.js` with `defer` only on the home page and add the initial body scroll-lock class.

- [ ] **Step 5: Copy the approved intro asset**

Copy the exact supplied MP4 to `assets/videos/site-intro.mp4` without transcoding. Verify the destination size equals `1,272,662` bytes.

- [ ] **Step 6: Run tests and verify GREEN**

Run:

```powershell
node --test tests/intro-gate.test.js tests/home-navigation.test.js tests/project-build.test.js
```

Expected: all focused tests pass.

- [ ] **Step 7: Commit the intro behavior**

```powershell
git add assets/intro-gate.js assets/videos/site-intro.mp4 scripts/project-build.cjs tests/intro-gate.test.js index.html
git commit -m "feat: add session-once intro animation"
```

### Task 4: Multi-service filtering and Projects navigation

**Files:**
- Modify: `tests/project-build.test.js`
- Create: `tests/project-filter.test.js`
- Create: `assets/project-filter.cjs`
- Modify: `assets/site.js`
- Modify: `scripts/project-build.cjs`
- Modify: `projects.html` (generated)

**Interfaces:**
- Consumes: `Project.services: string[]` and space-safe HTML attributes.
- Produces: `matchesProjectFilter({ type, services, search }, filter) -> boolean` shared in tests and used by browser initialization.

- [ ] **Step 1: Write failing renderer and filter tests**

Require a delimiter-safe `data-services` value and correct multi-service matches:

```js
test("project card serializes all services", () => {
  const html = renderProjectCard({ ...validProject, services: ["AIGC", "CG & VFX"] });
  assert.match(html, /data-services="AIGC\|CG &amp; VFX"/);
});

test("service filter matches any assigned service", () => {
  assert.equal(matchesProjectFilter({ type: "FMCG", services: ["2D Animation", "Online"], search: "friso" }, "2D Animation"), true);
});
```

Assert the generated service buttons occur in `AIGC`, `CG & VFX`, `2D Animation`, `Online` order.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```powershell
node --test tests/project-build.test.js tests/project-filter.test.js
```

Expected: FAIL because cards serialize one `service`, the helper is absent, and the panel uses legacy labels.

- [ ] **Step 3: Implement shared filtering logic**

Implement `matchesProjectFilter` using exact Type equality, `services.includes(filter)`, or case-insensitive search matching. In `assets/site.js`, split the card's `data-services` value on `|` and call equivalent browser logic.

- [ ] **Step 4: Update card and filter rendering**

Change cards to `data-services="${project.services.join("|")}"`. Render buttons in the required order, with `2D Animation` immediately after `CG & VFX`.

- [ ] **Step 5: Build and verify GREEN**

Run:

```powershell
node scripts/build.cjs
node --test tests/project-build.test.js tests/project-filter.test.js
```

Expected: all filter and renderer tests pass.

- [ ] **Step 6: Commit Projects filtering**

```powershell
git add assets/project-filter.cjs assets/site.js scripts/project-build.cjs tests/project-build.test.js tests/project-filter.test.js projects.html
git commit -m "feat: support canonical multi-service filters"
```

### Task 5: Missing-video detail fallback and source links

**Files:**
- Modify: `tests/project-build.test.js`
- Modify: `scripts/project-build.cjs`
- Modify: `assets/styles.css`
- Modify: `projects/*/index.html` (generated)

**Interfaces:**
- Consumes: `project.video: string | null` and `project.sourceUrl: string | null`.
- Produces: `renderProjectMedia(project) -> string` used by `renderProjectDetail`.

- [ ] **Step 1: Write failing detail fallback tests**

Add:

```js
test("detail without local video renders a safe coming-soon state", () => {
  const html = renderProjectDetail({ ...validProject, video: null, sourceUrl: "https://www.xinpianchang.com/a1" }, []);
  assert.match(html, /Video coming soon/);
  assert.match(html, /href="https:\/\/www\.xinpianchang\.com\/a1"/);
  assert.doesNotMatch(html, /<video/);
  assert.doesNotMatch(html, /src=""|data-video-src=""/);
});
```

Also verify a project with a real video retains the current accessible player contract.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test tests/project-build.test.js
```

Expected: FAIL because validation rejects `null` video or the renderer emits an empty player.

- [ ] **Step 3: Implement conditional media rendering**

Extract `renderProjectMedia`. For a real video, return the existing player markup. For `null`, return a `.project-media-placeholder` section with the poster, `Video coming soon`, and an optional safe external link using `target="_blank" rel="noopener noreferrer"`.

- [ ] **Step 4: Add fallback styling**

Style the fallback to share the player aspect ratio, use the poster as a dimmed background, maintain readable text contrast, and stack correctly below 760px.

- [ ] **Step 5: Build all details and verify GREEN**

Run:

```powershell
node scripts/build.cjs
node --test tests/project-build.test.js
```

Expected: all 23 detail directories contain generated `index.html`; no missing-video page contains an empty video source.

- [ ] **Step 6: Commit media fallback**

```powershell
git add scripts/project-build.cjs assets/styles.css tests/project-build.test.js projects
git commit -m "feat: add missing-video project fallback"
```

### Task 6: Responsive visual integration and full verification

**Files:**
- Modify: `assets/styles.css`
- Modify: `README.md`
- Modify: generated `index.html`, `projects.html`, and `projects/*/index.html` only if the build changes them.

**Interfaces:**
- Consumes: intro, home, Projects, and detail markup from earlier tasks.
- Produces: final responsive presentation and documented publishing workflow.

- [ ] **Step 1: Add static CSS regression assertions**

Extend `tests/home-navigation.test.js` to require `.site-intro`, `.site-intro-skip`, `.home-projects .work-panel`, a mobile breakpoint, and a reduced-motion rule. Add a Projects assertion that `.projects-grid` has two columns by default and one below 760px.

- [ ] **Step 2: Run tests and verify RED**

Run:

```powershell
node --test tests/home-navigation.test.js
```

Expected: FAIL until the new responsive intro and home rules exist.

- [ ] **Step 3: Implement final CSS integration**

Add full-viewport intro positioning, fade-out state, skip-button focus treatment, body scroll lock, full-screen home panels, `object-fit: cover`, responsive typography, `prefers-reduced-motion` handling, and the two-column/one-column Projects behavior. Preserve current header navigation fixes.

- [ ] **Step 4: Update publishing documentation**

Document the new data fields, canonical labels, placeholder behavior, intro source path, build command, test command, and how to replace a placeholder poster or missing MP4 without changing a project slug.

- [ ] **Step 5: Run complete automated verification**

Run:

```powershell
node scripts/build.cjs
node --test tests/*.test.js
```

Expected: clean build and all tests pass with no warnings or failures.

- [ ] **Step 6: Scan generated references**

Run a PowerShell validation that extracts local `src`, `poster`, and `data-video-src` paths from generated HTML, resolves them under the repository, and fails if any referenced local file is missing. Explicitly assert 23 generated detail pages and 10 home work panels.

- [ ] **Step 7: Perform visual verification**

Serve the repository with a local static server and capture desktop (1440×900) and mobile (390×844) views of the intro, home, Projects page, one real-video detail, and one coming-soon detail. Check for clipping, unintended scroll locks, unreadable controls, broken images, and incorrect grid columns.

- [ ] **Step 8: Re-run tests after visual fixes**

Run:

```powershell
node scripts/build.cjs
node --test tests/*.test.js
```

Expected: all tests still pass after any targeted CSS adjustments.

- [ ] **Step 9: Commit final integration**

```powershell
git add assets/styles.css README.md index.html projects.html projects tests/home-navigation.test.js
git commit -m "feat: complete responsive project publishing flow"
```
