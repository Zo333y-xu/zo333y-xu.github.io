# Navigation, About, Contact and Social Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the Project browse menu, About layout and three-row logo motion, Contact content and map, and the shared footer social icons to match the supplied artwork, then publish the verified static site to GitHub Pages.

**Architecture:** Keep the existing four-page static HTML architecture and shared `assets/styles.css` / `assets/site.js` files. Add three local raster assets derived directly from the supplied artwork, express the About logo wall as three duplicated CSS marquee tracks, and reuse one shared social-icon strip on every page.

**Tech Stack:** Semantic HTML5, CSS animations and responsive media queries, vanilla JavaScript, Node.js test runner, Playwright, GitHub Pages.

## Global Constraints

- Preserve the home page content, project order, project artwork, pointer-following hover label, navigation routes, and every `Get in touch!` link.
- Project menu labels must be `All / Type / Service / Search`.
- Type values must be `3C & Tech / Automotive / FMCG / Beauty & Fashion / Short film`.
- Service values must be `AI-Generated / CG&VFX / Online`.
- About client logos must use three independent seamless tracks; rows 1 and 3 move left, row 2 moves right, hover pauses, and reduced-motion disables animation.
- Contact address must be `3RD FLOOR, NO. 553, MAOTAI ROAD, CHANGNING DISTRICT, SHANGHAI, CHINA`.
- All four pages must use the supplied WeChat, Xiaohongshu, and Douyin icon strip.
- At 320px viewport width, no page may have horizontal overflow.
- Do not add dependencies or third-party map requests.

---

### Task 1: Add exact visual assets

**Files:**
- Create: `assets/images/contact-map-2026.png`
- Create: `assets/images/about-studio-detail.png`
- Create: `assets/images/social-icons-cn.png`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: User artwork at `C:/Users/xuziw/Desktop/画板/Desktop-05.png`, `C:/Users/xuziw/Desktop/画板/717-03.png`, and `C:/Users/xuziw/Desktop/画板/资源 16-8.png`.
- Produces: Three local PNG files referenced by later HTML and CSS tasks.

- [ ] **Step 1: Write the failing asset test**

Add this test to `tests/site.test.mjs`:

```js
test("ships the supplied contact, about, and social assets", async () => {
  for (const file of [
    "assets/images/contact-map-2026.png",
    "assets/images/about-studio-detail.png",
    "assets/images/social-icons-cn.png",
  ]) {
    assert.equal(existsSync(path.join(siteDir, file)), true, `${file} should exist`);
    assert.ok((await stat(path.join(siteDir, file))).size > 1_000, `${file} should not be empty`);
  }
});
```

- [ ] **Step 2: Run the asset test and verify it fails**

Run: `node --test --test-name-pattern="ships the supplied contact" tests/site.test.mjs`

Expected: FAIL because `contact-map-2026.png` does not exist.

- [ ] **Step 3: Create the exact cropped assets**

Use Pillow from the bundled Python runtime to crop only the supplied pixels:

```python
from pathlib import Path
from PIL import Image

source = Path(r"C:/Users/xuziw/Desktop/画板")
dest = Path(r"assets/images")

with Image.open(source / "Desktop-05.png") as image:
    image.crop((2179, 996, 5334, 2775)).save(dest / "contact-map-2026.png", optimize=True)

with Image.open(source / "717-03.png") as image:
    image.crop((1341, 6622, 2521, 8225)).save(dest / "about-studio-detail.png", optimize=True)

with Image.open(source / "资源 16-8.png") as image:
    image.save(dest / "social-icons-cn.png", optimize=True)
```

Visually inspect both crops and adjust only the crop rectangle if an edge from the surrounding page remains visible.

- [ ] **Step 4: Run the asset test and verify it passes**

Run: `node --test --test-name-pattern="ships the supplied contact" tests/site.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit the asset slice**

```bash
git add tests/site.test.mjs assets/images/contact-map-2026.png assets/images/about-studio-detail.png assets/images/social-icons-cn.png
git commit -m "Add refreshed site artwork assets"
```

---

### Task 2: Replace the Project browse taxonomy

**Files:**
- Modify: `projects.html`
- Modify: `assets/site.js`
- Modify: `assets/styles.css`
- Modify: `tests/site.test.mjs`

**Interfaces:**
- Consumes: Existing `[data-browse-tab]`, `[data-browse-panel]`, `.project-card`, and `applyProjectFilters()` behavior.
- Produces: `type` and `service` filter groups with exact visible labels and matching `data-type` / `data-service` card metadata.

- [ ] **Step 1: Replace old menu expectations with failing taxonomy tests**

Update the structure and browser tests to assert:

```js
assert.match(projects, /data-browse-tab="service"/);
assert.doesNotMatch(projects, /data-browse-tab="media"/);
for (const label of ["3C &amp; Tech", "Automotive", "FMCG", "Beauty &amp; Fashion", "Short film"]) {
  assert.match(projects, new RegExp(`>${label}<`));
}
for (const label of ["AI-Generated", "CG&amp;VFX", "Online"]) {
  assert.match(projects, new RegExp(`>${label}<`));
}
```

In the Playwright test, replace the Media interaction with:

```js
await page.locator('[data-browse-tab="service"]').click();
assert.equal(await page.locator('[data-browse-panel="service"]:not([hidden])').count(), 1);
await page.locator('[data-browse-panel="service"] button', { hasText: "CG&VFX" }).click();
assert.ok(await page.locator('.project-card:not([hidden])').count() >= 1);
```

- [ ] **Step 2: Run the taxonomy tests and verify they fail**

Run: `node --test --test-name-pattern="supplied page structure|browse tabs" tests/site.test.mjs`

Expected: FAIL because `media` still exists and `service` does not.

- [ ] **Step 3: Implement exact menu labels and card metadata**

In `projects.html`, use this panel shape:

```html
<button type="button" data-browse-tab="service" aria-expanded="false">Service</button>
<div class="browse-panel" data-browse-panel="service" hidden>
  <button type="button" data-filter-group="service" data-filter-value="ai-generated">AI-Generated</button>
  <button type="button" data-filter-group="service" data-filter-value="cg-vfx">CG&amp;VFX</button>
  <button type="button" data-filter-group="service" data-filter-value="online">Online</button>
</div>
```

Use `data-type` values `3c-tech`, `automotive`, `fmcg`, `beauty-fashion`, or `short-film`, plus `data-service` values `ai-generated`, `cg-vfx`, or `online` on every card. In `assets/site.js`, read service metadata with:

```js
const matchesCategory = activeFilter.group === "all"
  || card.dataset[activeFilter.group] === activeFilter.value;
```

Retain the existing search term match and pointer-following hover handlers unchanged.

- [ ] **Step 4: Keep panel text at menu scale and run tests**

Ensure `assets/styles.css` preserves the existing exact values:

```css
.browse-panel button,
.browse-panel--search input { font-size: 14px; }
```

Run: `node --test --test-name-pattern="supplied page structure|browse subcategory|project search|browse tabs" tests/site.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit the Project menu slice**

```bash
git add projects.html assets/site.js assets/styles.css tests/site.test.mjs
git commit -m "Update project browse taxonomy"
```

---

### Task 3: Rebuild About content and three logo tracks

**Files:**
- Modify: `about.html`
- Modify: `assets/styles.css`
- Modify: `tests/site.test.mjs`

**Interfaces:**
- Consumes: `assets/images/about-studio.jpg`, `assets/images/about-studio-detail.png`, and the eleven existing `assets/images/logos/logo-row-*.jpg` images.
- Produces: `.about-detail`, `.logo-marquee--left`, `.logo-marquee--right`, and three duplicated `.logo-marquee__track` elements.

- [ ] **Step 1: Write failing About structure and motion tests**

Replace the two-lane test with:

```js
test("renders the refreshed About layout and three alternating logo lanes", async () => {
  const about = await text("about.html");
  const css = await text("assets/styles.css");
  assert.match(about, /assets\/images\/about-studio-detail\.png/);
  assert.match(about, /class="about-detail"/);
  assert.equal((about.match(/class="logo-marquee(?:\s|")/g) || []).length, 3);
  assert.equal((about.match(/class="logo-marquee__track/g) || []).length, 6);
  assert.match(css, /@keyframes logo-marquee-left/);
  assert.match(css, /@keyframes logo-marquee-right/);
  assert.match(css, /\.logo-marquee:hover[\s\S]*animation-play-state:\s*paused/s);
  assert.match(css, /prefers-reduced-motion: reduce[\s\S]*?\.logo-marquee__track[\s\S]*?animation:\s*none/s);
});
```

- [ ] **Step 2: Run the About test and verify it fails**

Run: `node --test --test-name-pattern="refreshed About" tests/site.test.mjs`

Expected: FAIL because the page still has two tracks and no detail image.

- [ ] **Step 3: Implement the refreshed About layout**

Replace the old definition/mindset/expertise rows with:

```html
<section class="about-detail content-width">
  <img src="assets/images/about-studio-detail.png" alt="White Pixl team working in the studio">
  <div class="about-detail__copy">
    <p>With rigorous craftsmanship and a strong commitment to data security, WhitePixl seamlessly blends local excellence with a global vision, empowering brands to deliver their messages with clarity, confidence, and style.</p>
    <p>Each project centers around a dedicated team, reinforced by a long-standing, trusted network of local and international freelancers who share our discipline and taste.</p>
  </div>
</section>
```

Build three `.logo-marquee` containers. Each container must contain two identical `.logo-marquee__track` groups for seamless repetition. Distribute rows 01-04 to lane one, 05-08 to lane two, and 09-11 plus 01 to lane three.

- [ ] **Step 4: Implement responsive alternating motion**

Add the exact motion contract:

```css
.logo-marquee--left .logo-marquee__track { animation: logo-marquee-left 34s linear infinite; }
.logo-marquee--right .logo-marquee__track { animation: logo-marquee-right 39s linear infinite; }
.logo-marquee--slow .logo-marquee__track { animation-duration: 43s; }
.logo-marquee:hover .logo-marquee__track { animation-play-state: paused; }
@keyframes logo-marquee-left { to { transform: translateX(-100%); } }
@keyframes logo-marquee-right { from { transform: translateX(-100%); } to { transform: translateX(0); } }
@media (prefers-reduced-motion: reduce) {
  .logo-marquee__track { animation: none; transform: none; }
}
```

Use a two-column `.about-detail` grid on desktop and one column below 760px.

- [ ] **Step 5: Run About tests and commit**

Run: `node --test --test-name-pattern="About|logo lanes|reduced-motion" tests/site.test.mjs`

Expected: PASS.

```bash
git add about.html assets/styles.css tests/site.test.mjs
git commit -m "Refresh about page and logo motion"
```

---

### Task 4: Replace Contact content, map, and shared social icons

**Files:**
- Modify: `contact.html`
- Modify: `index.html`
- Modify: `projects.html`
- Modify: `about.html`
- Modify: `assets/styles.css`
- Modify: `tests/site.test.mjs`

**Interfaces:**
- Consumes: `assets/images/contact-map-2026.png` and `assets/images/social-icons-cn.png` from Task 1.
- Produces: Exact Contact copy and one shared `.social-icons-image` footer pattern on all four pages.

- [ ] **Step 1: Write failing Contact and social tests**

Add:

```js
test("uses the refreshed Contact details and map", async () => {
  const contact = await text("contact.html");
  assert.match(contact, /3RD FLOOR, NO\. 553, MAOTAI ROAD/);
  assert.match(contact, /CHANGNING DISTRICT, SHANGHAI, CHINA/);
  assert.match(contact, /www\.whitepixl\.com/);
  assert.match(contact, />WECHAT</);
  assert.match(contact, />RED</);
  assert.match(contact, />DOUYIN</);
  assert.match(contact, /assets\/images\/contact-map-2026\.png/);
  assert.doesNotMatch(contact, /contact-layout-reference\.png/);
});

test("uses the supplied Chinese social icon strip on every page", async () => {
  for (const file of ["index.html", "projects.html", "about.html", "contact.html"]) {
    const html = await text(file);
    assert.match(html, /class="social-icons-image"/);
    assert.match(html, /assets\/images\/social-icons-cn\.png/);
    assert.doesNotMatch(html, /class="social-links"/);
  }
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run: `node --test --test-name-pattern="refreshed Contact|Chinese social" tests/site.test.mjs`

Expected: FAIL on old address, old map, and text social links.

- [ ] **Step 3: Implement Contact copy and new map**

Use:

```html
<div class="contact-map">
  <img src="assets/images/contact-map-2026.png" alt="Map showing White Pixl near Maotai Road in Shanghai">
</div>
```

Update address, telephone, email, website, WECHAT, RED, and DOUYIN exactly as specified. Keep the `<a href="tel:021-62262933">` and `<a href="mailto:WHITEPIXL@VIP.COM">` semantics.

- [ ] **Step 4: Replace the footer icon group on all pages**

Use the identical fragment in all four footers:

```html
<div class="social-icons-image" role="img" aria-label="WeChat, Xiaohongshu and Douyin"></div>
```

Add:

```css
.social-icons-image {
  width: 192px;
  aspect-ratio: 192 / 40;
  background: url("images/social-icons-cn.png") center / contain no-repeat;
  flex: 0 0 auto;
}
```

Below 760px, set its width to `144px`.

- [ ] **Step 5: Run Contact and social tests and commit**

Run: `node --test --test-name-pattern="Contact|social icon|Get in touch" tests/site.test.mjs`

Expected: PASS.

```bash
git add contact.html index.html projects.html about.html assets/styles.css tests/site.test.mjs
git commit -m "Refresh contact page and social icons"
```

---

### Task 5: Full regression, responsive visual QA, build, and publish

**Files:**
- Modify if required by verification: `assets/styles.css`
- Generated: `dist/client/**`, `dist/server/index.js`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: Completed static pages from Tasks 1-4.
- Produces: Verified `dist` build and updated GitHub Pages `main` branch.

- [ ] **Step 1: Add browser assertions for overflow and marquee directions**

Add a Playwright test that visits all pages at 320px and 1440px:

```js
for (const width of [320, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const file of ["index.html", "projects.html", "about.html", "contact.html"]) {
    await page.goto(`${origin}/${file}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 1, `${file} should not overflow at ${width}px`);
  }
  await page.close();
}
```

- [ ] **Step 2: Run the complete suite**

Run: `node --test tests/site.test.mjs`

Expected: all tests PASS, including existing project hover and CTA tests.

- [ ] **Step 3: Build the production bundle**

Run: `npm run build`

Expected: `Built 4 pages into .../dist`.

- [ ] **Step 4: Render and inspect desktop and mobile pages**

Use the local test server and Playwright screenshots for:

- `projects.html` at 1440x900 and 390x844.
- `about.html` at 1440x900 and 390x844.
- `contact.html` at 1440x900 and 390x844.

Confirm menu scale, three logo lanes, Contact crop, shared icon alignment, no accidental screenshot borders, and no horizontal overflow. Fix only verified visual deviations, then rerun `node --test tests/site.test.mjs` and `npm run build`.

- [ ] **Step 5: Commit final verification adjustments**

```bash
git add assets/styles.css tests/site.test.mjs dist
git commit -m "Verify responsive site refresh"
```

If `git status --short` shows no final adjustment, skip this empty commit.

- [ ] **Step 6: Publish and verify GitHub Pages**

Push the intentional commits to `Zo333y-xu/zo333y-xu.github.io` main. Then request `https://zo333y-xu.github.io/?v=<new-commit-sha>` and verify the HTML references `assets/images/social-icons-cn.png`; request `projects.html`, `about.html`, and `contact.html` with the same cache-busting query and verify their new labels/content.

Expected: HTTP 200 for all four pages and the updated content visible online.
