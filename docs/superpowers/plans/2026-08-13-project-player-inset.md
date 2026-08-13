# Project Player Inset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Center the project player within modest desktop and mobile margins without changing media behavior.

**Architecture:** Implement the inset entirely in the existing `.project-player` CSS rule so real-video and fallback states inherit the same layout. Lock exact widths and margins in a stylesheet regression test, then verify computed geometry in desktop and mobile Chrome.

**Tech Stack:** Static CSS, Node.js test runner, Playwright Chrome verification, GitHub Pages.

## Global Constraints

- Desktop player width is `min(calc(100% - 6vw), 1600px)` and centered.
- Desktop vertical margin is `clamp(24px, 3vw, 48px)`.
- Mobile player width is `calc(100% - 32px)` with `16px auto` margin.
- Desktop aspect ratio remains 16:9; mobile aspect ratio remains 16:10.
- Real-video and fallback players use the same layout.
- Do not change media files, project data, covers, recommendations, navigation, controls, or playback scripts.

---

### Task 1: Add the player inset regression and implementation

**Files:**
- Modify: `tests/project-build.test.js`
- Modify: `assets/styles.css:845,873`

**Interfaces:**
- Consumes: `.project-player` markup already emitted for both real and fallback media.
- Produces: centered player geometry with stable desktop and mobile margins.

- [ ] **Step 1: Write the failing CSS contract**

Extend `detail-page stylesheet includes responsive player and recommendation rules` to assert the base `.project-player` rule contains `width: min(calc(100% - 6vw), 1600px)` and `margin: clamp(24px, 3vw, 48px) auto`, and the mobile media query contains `width: calc(100% - 32px)` and `margin: 16px auto`.

- [ ] **Step 2: Run the focused test and verify RED**

```powershell
& 'C:\Users\xuziw\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests/project-build.test.js
```

Expected: failure because the current player is `width: 100%` with no margin.

- [ ] **Step 3: Implement the minimal CSS**

Update the base rule to:

```css
.project-player { position: relative; width: min(calc(100% - 6vw), 1600px); margin: clamp(24px, 3vw, 48px) auto; aspect-ratio: 16 / 9; overflow: hidden; background: var(--black); }
```

Update the mobile rule to:

```css
.project-player { width: calc(100% - 32px); margin: 16px auto; aspect-ratio: 16 / 10; }
```

- [ ] **Step 4: Run focused and full tests, then build**

Run the focused test, `node --test tests/*.test.js`, and `node scripts/build.cjs` with the bundled Node executable.

Expected: all tests pass and the build exits 0.

- [ ] **Step 5: Verify local desktop and mobile geometry**

At 1440×900 assert player width is approximately 1353.6px and both side margins approximately 43.2px. At 390×844 assert player width is 358px and both side margins 16px. Require expected aspect ratios, no horizontal overflow, and identical fallback geometry.

- [ ] **Step 6: Commit**

```powershell
git add assets/styles.css tests/project-build.test.js
git commit -m "fix: inset project video players"
```

### Task 2: Publish and verify production

**Files:**
- No additional production files.

**Interfaces:**
- Consumes: verified player inset commit.
- Produces: the approved inset player on GitHub Pages.

- [ ] **Step 1: Merge into a clean isolated `main` worktree and rerun tests, build, and browser geometry checks.**

- [ ] **Step 2: Push `main` and wait for GitHub Pages to serve the new CSS.**

- [ ] **Step 3: Run the same desktop/mobile geometry checks against `https://zo333y-xu.github.io`, requiring zero relevant page or HTTP errors.**

- [ ] **Step 4: Report the production URL, merge SHA, measured margins, test count, and online browser result.**
