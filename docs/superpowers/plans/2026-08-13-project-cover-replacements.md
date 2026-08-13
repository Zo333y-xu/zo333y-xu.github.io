# Project Cover Replacements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace five project covers with the exact supplied originals and remove the black title strip from recommendation cards while retaining overlaid titles.

**Architecture:** Preserve each source image byte-for-byte and update catalog poster paths only where the original format changes. Keep recommendation markup unchanged, but turn each card into a 16:9 positioned frame whose image fills the frame and whose title overlays the image without an independent title bar.

**Tech Stack:** Node.js test runner, CommonJS catalog/build script, static HTML/CSS, PowerShell file copy, Playwright browser verification.

## Global Constraints

- Preserve every source file's original pixel dimensions and encoding; do not crop, resize, or recompress.
- Keep existing home, Projects, detail, recommendation, and video behavior except for the requested poster files and recommendation-card presentation.
- Recommendation cards must be 16:9, must use `object-fit: cover`, must retain the title over the image, and must have no independent black title strip or black border.
- Desktop recommendations remain three columns; mobile recommendations remain horizontally scrollable.
- Do not modify or delete any source file on `S:`.

---

### Task 1: Add cover identity and recommendation-layout regressions

**Files:**
- Create: `tests/project-cover-replacements.test.js`
- Modify: `tests/project-build.test.js`
- Test: `tests/project-cover-replacements.test.js`
- Test: `tests/project-build.test.js`

**Interfaces:**
- Consumes: website files in `assets/images`, poster paths exported by `data/projects.cjs`, and recommendation styles in `assets/styles.css`.
- Produces: persistent tests for exact supplied bytes, original dimensions, poster extension changes, removal of stale formats, and the borderless 16:9 recommendation contract.

- [ ] **Step 1: Write the failing cover identity test**

Create `tests/project-cover-replacements.test.js` with SHA-256 and dimensions for these targets:

```js
const expected = [
  ["touareg-x-wu-jing-cover.png", "F71C7C211460E58AFCF18DD9A80C942DA330AACAA2600E7227A1D6E08B458FF1", 4680, 2160],
  ["universal-studio-cover.jpg", "540383CF4D0B529B904675DF2F5709EA7A00DFA83777DCA1F43D1A15D428E3CA", 2276, 1280],
  ["huawei-nora-band-10-cover.jpg", "1137A09A789AC72DA5C9C2DDFDD25E0D24E34C83FA00925E25FD1B64E93EBC25", 3840, 2160],
  ["huawei-freebuds-pro-3-cover.jpg", "F921A53496108E6FE923DD984B424848E7781D6E1E27AC4D0ED7F70DD0995833", 3840, 2160],
  ["sanrio-brand-2025-cover.png", "1EEF39813E4A638AA5BA2689B7CF593091B3F44F2ECDD5281DC6537E1D77F77C", 3840, 2160],
];
```

Use `node:crypto` to compare hashes, read PNG dimensions from bytes 16–23, and parse JPEG SOF markers for dimensions. Assert that the three obsolete files do not exist and that catalog poster paths match all five targets.

- [ ] **Step 2: Add the failing recommendation CSS contract**

Extend the existing detail stylesheet test to assert that `.browse-more-card` is positioned, has `aspect-ratio: 16 / 9`, and has no solid black background; `.browse-more-card img` is absolutely positioned, fills the card, and uses `object-fit: cover`; `.browse-more-card span` is absolutely positioned over the image with no independent block height.

- [ ] **Step 3: Run focused tests and verify RED**

```powershell
& 'C:\Users\xuziw\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests/project-cover-replacements.test.js tests/project-build.test.js
```

Expected: failures for missing new JPG/PNG paths, old cover hashes, present stale formats, and the current recommendation title strip CSS.

### Task 2: Replace covers and update catalog paths

**Files:**
- Modify: `assets/images/touareg-x-wu-jing-cover.png`
- Modify: `assets/images/universal-studio-cover.jpg`
- Create: `assets/images/huawei-nora-band-10-cover.jpg`
- Create: `assets/images/huawei-freebuds-pro-3-cover.jpg`
- Create: `assets/images/sanrio-brand-2025-cover.png`
- Delete: `assets/images/huawei-nora-band-10-cover.png`
- Delete: `assets/images/huawei-freebuds-pro-3-cover.png`
- Delete: `assets/images/sanrio-brand-2025-cover.jpg`
- Modify: `data/projects.cjs`
- Test: `tests/project-cover-replacements.test.js`

**Interfaces:**
- Consumes: five user-supplied source paths defined in the design specification.
- Produces: exact original cover binaries at canonical website paths and catalog poster strings that reference them.

- [ ] **Step 1: Copy the five sources without transformation**

Use `Copy-Item -LiteralPath <source> -Destination <target> -Force` for each exact mapping. Do not open and save through an image library.

- [ ] **Step 2: Update three catalog poster extensions**

Change FreeBuds and NORA from `.png` to `.jpg`; change Sanrio from `.jpg` to `.png`. Leave Touareg and Universal poster strings unchanged.

- [ ] **Step 3: Remove only the three obsolete image files**

Delete `huawei-nora-band-10-cover.png`, `huawei-freebuds-pro-3-cover.png`, and `sanrio-brand-2025-cover.jpg` after confirming they are exactly the old targets and lie under `assets/images`.

- [ ] **Step 4: Run the cover identity test and verify GREEN**

Run `node --test tests/project-cover-replacements.test.js` with the bundled Node executable.

Expected: exact hashes, dimensions, poster paths, and stale-file checks pass.

### Task 3: Remove the recommendation title strip

**Files:**
- Modify: `assets/styles.css:861-867`
- Test: `tests/project-build.test.js`

**Interfaces:**
- Consumes: unchanged `<a><img><span></span></a>` recommendation markup.
- Produces: a 16:9 image-only card surface with the title overlaid at the bottom and no independent black bar.

- [ ] **Step 1: Implement the minimal CSS**

Set the card to `position: relative; aspect-ratio: 16 / 9; overflow: hidden;` with no black background. Set the image to `position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover`. Set the span to `position: absolute; z-index: 1; right: 0; bottom: 0; left: 0;` and apply title padding plus a subtle transparent gradient using a pseudo-element or span background gradient, never a solid title strip.

- [ ] **Step 2: Run the focused recommendation test and verify GREEN**

Run the focused test command from Task 1.

Expected: recommendation CSS and cover tests pass.

- [ ] **Step 3: Run the full test suite and build**

```powershell
& 'C:\Users\xuziw\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests/*.test.js
& 'C:\Users\xuziw\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/build.cjs
```

Expected: all tests pass and build exits 0.

- [ ] **Step 4: Verify desktop and mobile in Chrome**

At 1440×900 and 390×844, verify all five images load; recommendation cards are 16:9, images fill their cards with `object-fit: cover`, titles overlay the image, no card has a separate black strip, desktop uses three columns, mobile scrolls horizontally, and no page has horizontal overflow outside the intended recommendation scroller.

- [ ] **Step 5: Commit implementation**

```powershell
git add --sparse assets/images data/projects.cjs assets/styles.css tests
git commit -m "fix: replace project covers and recommendation strips"
```

### Task 4: Publish and verify production

**Files:**
- No additional production files.

**Interfaces:**
- Consumes: verified implementation commit.
- Produces: new covers and borderless recommendation cards on GitHub Pages.

- [ ] **Step 1: Merge the verified branch into `main` and push**

Use an isolated clean `main` worktree so the user's unrelated working files remain untouched.

- [ ] **Step 2: Wait for Pages propagation**

Poll all five production image URLs until their content hashes or content lengths match the new originals.

- [ ] **Step 3: Run the production Chrome check**

Verify the homepage, Projects page, and representative detail pages at desktop and mobile sizes. Require zero relevant page errors, zero relevant HTTP errors, loaded new covers, 16:9 recommendation frames, overlaid titles, and no black title strip.

- [ ] **Step 4: Report deployment evidence**

Report the production URLs, merge SHA, five exact dimensions, final test count, and browser results.
