# Project and Contact Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the supplied Project and Contact page compositions, preserve Project filtering, and route every `Get in touch!` CTA to the Contact page.

**Architecture:** Extend the existing semantic static HTML and shared CSS rather than introducing a framework. Reuse the current project images and JavaScript filtering, add permanent project-title overlays, and display the supplied Contact reference as a precisely clipped responsive map asset.

**Tech Stack:** HTML5, native CSS, vanilla JavaScript, Node.js test runner, Playwright, GitHub Pages.

## Global Constraints

- Preserve `index.html`, `projects.html`, `about.html`, and `contact.html` routes.
- Preserve the Type, Media, and Search controls and their current JavaScript behavior.
- Keep the site light themed with black, gray, white, and the existing red selection accent.
- Do not add third-party fonts, libraries, analytics, or external image dependencies.
- Every `Get in touch!` CTA must navigate to `contact.html`.
- Keep desktop navigation on one line and provide explicit mobile layout rules below 760px.

---

### Task 1: Lock New Requirements in Tests

**Files:**
- Modify: `tests/site.test.mjs`

**Interfaces:**
- Consumes: the four root HTML pages and `assets/styles.css`.
- Produces: regression checks for CTA routing, permanent project titles, Contact reference asset, and retained browser filters.

- [ ] **Step 1: Add failing structural tests**

Add assertions that all four pages contain `href="contact.html"` on any `Get in touch!` CTA, that six `.project-title` elements exist, and that Contact references `assets/images/contact-layout-reference.png`.

- [ ] **Step 2: Run tests to verify failure**

Run: `node --test tests/site.test.mjs`

Expected: FAIL because the CTA, project-title, and Contact reference requirements are not yet implemented.

- [ ] **Step 3: Commit the failing tests with the implementation tasks**

The tests remain uncommitted until Tasks 2 through 4 pass, avoiding a permanently red repository commit.

### Task 2: Update Global CTA Routing

**Files:**
- Modify: `index.html`
- Modify: `projects.html`
- Modify: `about.html`

**Interfaces:**
- Consumes: existing `.footer-cta` markup.
- Produces: consistent navigation to `contact.html`.

- [ ] **Step 1: Replace email CTA links**

Change only footer CTA anchors whose visible text is `Get in touch!` from `mailto:info@whitepixl.com` to `contact.html`. Preserve the informational email links in the footer copy.

- [ ] **Step 2: Run the CTA regression test**

Run: `node --test --test-name-pattern="Get in touch" tests/site.test.mjs`

Expected: PASS.

### Task 3: Rebuild the Project Composition

**Files:**
- Modify: `projects.html`
- Modify: `assets/styles.css`

**Interfaces:**
- Consumes: existing `.project-card`, filter data attributes, and six project images.
- Produces: six permanent `.project-title` overlays while retaining `.project-hover` feedback and all filter metadata.

- [ ] **Step 1: Add permanent project-title markup**

Each project card receives one title with a regular project name and an emphasized creator segment, for example:

```html
<span class="project-title"><span>The Dawn</span> <em>BY AKI</em></span>
```

Use the supplied names: The Dawn / BY AKI, Space Travel / BY BAO, Urban Silence / BY CHIAN, Golden Hour / BY ZOEC, elf / BY GUIN, AUDI / BY ZACK.

- [ ] **Step 2: Match desktop spacing and the two-column image grid**

Reduce `.browse-stage` to the screenshot's compact white introduction height, keep two equal columns, and center permanent white titles over the images. Titles remain visible during hover and keyboard focus.

- [ ] **Step 3: Preserve functional filter panels**

Do not alter `data-browse-tab`, `data-browse-panel`, `data-project-filter`, `data-type`, `data-media`, or `data-search` values.

- [ ] **Step 4: Add mobile rules**

At 760px and below, retain the existing one-column grid, reduce title scale, and keep the browse controls on one line without overflow.

- [ ] **Step 5: Run Project tests**

Run: `node --test --test-name-pattern="page structure|browse tabs|project titles" tests/site.test.mjs`

Expected: PASS.

### Task 4: Rebuild the Contact Composition

**Files:**
- Add: `assets/images/contact-layout-reference.png`
- Modify: `contact.html`
- Modify: `assets/styles.css`

**Interfaces:**
- Consumes: user-supplied `Desktop-05.png`, existing contact text, telephone link, email links, and shared navigation.
- Produces: a semantic Contact page with a clipped responsive map region.

- [ ] **Step 1: Add the supplied reference asset unchanged**

Copy `C:/Users/xuziw/Desktop/新logo/Desktop-05.png` to `assets/images/contact-layout-reference.png` without recompression.

- [ ] **Step 2: Update Contact map markup**

Replace `contact-map.jpg` with `contact-layout-reference.png`, retain the figure and accessible caption, and add a `contact-map-reference` class to the image.

- [ ] **Step 3: Match the desktop Contact composition**

Set the oversized centered heading, 41/59 detail split, approximately 640px detail section, two-column contact labels, clipped map aspect ratio, lower top rule, single-line wide-screen tagline, and bottom-aligned company/social content.

- [ ] **Step 4: Add explicit mobile collapse**

At 760px and below, stack copy then map, preserve the map crop, allow the tagline to wrap, and maintain readable 12px contact text.

- [ ] **Step 5: Run Contact tests**

Run: `node --test --test-name-pattern="contact" tests/site.test.mjs`

Expected: PASS.

### Task 5: Full Verification and Publication

**Files:**
- Modify if needed: `README.md`
- Publish: GitHub repository `Zo333y-xu/zo333y-xu.github.io`

**Interfaces:**
- Consumes: the complete static site.
- Produces: verified public Project and Contact URLs.

- [ ] **Step 1: Run all tests and build**

Run: `node --test tests/site.test.mjs`

Expected: all tests pass.

Run: `npm run build`

Expected: exit code 0 with updated static assets copied to `dist/client`.

- [ ] **Step 2: Render desktop and mobile screenshots**

Use Playwright at 1440x1200 and 390x844 for both `projects.html` and `contact.html`. Inspect header alignment, grid/crop behavior, footer, and overflow.

- [ ] **Step 3: Run pre-flight checks**

Verify no horizontal overflow, no broken relative links, no missing assets, no em dash in visible copy, and all keyboard controls remain accessible.

- [ ] **Step 4: Commit the implementation**

```bash
git add index.html projects.html about.html contact.html assets/styles.css assets/images/contact-layout-reference.png tests/site.test.mjs docs/superpowers/plans/2026-07-16-project-contact-redesign.md
git commit -m "Match Project and Contact reference layouts"
```

- [ ] **Step 5: Publish and verify GitHub Pages**

Upload the new commit to `main`, wait for Pages, then request the four HTML pages and every referenced local asset. Expected: HTTP 200 and remote byte sizes equal local byte sizes.

