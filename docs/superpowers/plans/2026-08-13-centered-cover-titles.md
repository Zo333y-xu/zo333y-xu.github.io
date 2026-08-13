# Centered Cover Titles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show every project's English title as centered white text over its cover on the home page and Projects listing.

**Architecture:** Extend the existing static HTML renderer so home panels always emit visible title markup, then replace the Projects card's visually-hidden title treatment with a shared centered overlay style. Preserve existing links, metadata, image behavior, and generated-page workflow.

**Tech Stack:** CommonJS static-site generator, semantic HTML, native CSS, Node.js test runner.

## Global Constraints

- Titles are visible white text, horizontally and vertically centered.
- Long titles wrap to at most two centered lines with responsive sizing.
- Use restrained dark text shadow without a full-card overlay.
- Do not add titles to project detail video or poster media.
- Preserve routes, aspect ratios, filters, hover zoom, alt text, aria labels, and keyboard behavior.
- Visible titles must be real HTML text and must not intercept pointer input.

---

### Task 1: Renderer Regression Contract

**Files:**
- Modify: `tests/project-build.test.js`
- Test: `tests/project-build.test.js`

**Interfaces:**
- Consumes: `renderHomeProject(project, options)` and `renderProjectCard(project, prefix)` exported by `scripts/project-build.cjs`.
- Produces: Regression assertions requiring `.cover-title` markup with the escaped English project title in both renderers.

- [ ] **Step 1: Write the failing renderer tests**

Add assertions to the existing home panel and project card tests:

```js
assert.match(homePanel, /<span class="cover-title">Audi x Zheng Qinwen<\/span>/);
assert.match(projectCard, /<span class="project-title cover-title"><span>Audi x Zheng Qinwen<\/span>/);
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```powershell
& $node --test tests\project-build.test.js
```

Expected: FAIL because home panels do not emit `.cover-title` and Projects cards do not yet share that class.

- [ ] **Step 3: Commit the regression contract with the implementation in Task 2**

The failing test is intentionally committed together with the minimal renderer implementation after it passes.

### Task 2: Emit Titles on Every Cover

**Files:**
- Modify: `scripts/project-build.cjs:153-164`
- Modify: `scripts/project-build.cjs:205-215`
- Test: `tests/project-build.test.js`

**Interfaces:**
- Consumes: `project.title`, escaped through the existing `escapeHtml` helper.
- Produces: `<span class="cover-title">` for home panels and `<span class="project-title cover-title">` for Projects cards.

- [ ] **Step 1: Update `renderHomeProject`**

Remove placeholder-only caption branching and always render the title:

```js
return `    <a class="work-panel reveal" href="projects/${escapeHtml(project.slug)}/"${placeholderAttribute} aria-label="${escapeHtml(project.title)}">
      <img src="${escapeHtml(project.poster)}" alt="${escapeHtml(project.imageAlt)}"${loading}>
      <span class="cover-title">${escapeHtml(project.title)}</span>
    </a>`;
```

- [ ] **Step 2: Give Projects card titles the shared overlay class**

Update the existing title element without changing its English and Chinese content:

```html
<span class="project-title cover-title"><span>${escapeHtml(project.title)}</span><small>${escapeHtml(project.titleZh)}</small></span>
```

- [ ] **Step 3: Run the focused test and verify it passes**

Run:

```powershell
& $node --test tests\project-build.test.js
```

Expected: all project-build tests PASS.

- [ ] **Step 4: Commit renderer and test changes**

```powershell
git add scripts/project-build.cjs tests/project-build.test.js
git commit -m "feat: render titles on every project cover"
```

### Task 3: Centered White Overlay Styling

**Files:**
- Modify: `assets/styles.css`
- Test: `tests/project-build.test.js`

**Interfaces:**
- Consumes: `.cover-title`, `.project-title`, `.work-panel`, and `.project-card` markup from Task 2.
- Produces: A consistent, pointer-transparent centered title overlay for home and Projects covers.

- [ ] **Step 1: Add a CSS contract assertion**

In the stylesheet regression section, assert that the shared overlay includes absolute full-cover positioning, centering, white color, and no pointer interception:

```js
assert.match(styles, /\.cover-title\s*\{[\s\S]*position:\s*absolute[\s\S]*inset:\s*0[\s\S]*place-items:\s*center[\s\S]*color:\s*var\(--white\)[\s\S]*pointer-events:\s*none/);
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```powershell
& $node --test tests\project-build.test.js
```

Expected: FAIL because `.cover-title` styling does not exist.

- [ ] **Step 3: Implement the shared overlay style**

Add the following base treatment, then remove the old visually-hidden and placeholder-only positioning rules:

```css
.cover-title {
  position: absolute;
  z-index: 2;
  inset: 0;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  padding: clamp(16px, 4vw, 56px);
  color: var(--white);
  font-size: clamp(20px, 2.4vw, 42px);
  font-weight: 700;
  letter-spacing: -.035em;
  line-height: 1.05;
  text-align: center;
  text-wrap: balance;
  text-shadow: 0 2px 16px rgb(0 0 0 / .72), 0 1px 3px rgb(0 0 0 / .75);
  pointer-events: none;
}
```

Keep `.project-title small { display: none; }` so only the English title is shown. Add a mobile override of `font-size: clamp(18px, 6vw, 30px)` and `padding: 16px`.

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```powershell
& $node --test tests\project-build.test.js
```

Expected: all project-build tests PASS.

- [ ] **Step 5: Commit CSS changes**

```powershell
git add assets/styles.css tests/project-build.test.js
git commit -m "style: center white titles over project covers"
```

### Task 4: Build, Visual QA, and Publish

**Files:**
- Modify: generated `index.html`, `projects.html`, and `projects/*/index.html` files written by `scripts/build.cjs`
- Test: all `tests/*.test.js`

**Interfaces:**
- Consumes: renderer and CSS changes from Tasks 2 and 3.
- Produces: Updated static pages ready for GitHub Pages.

- [ ] **Step 1: Rebuild generated pages**

Run:

```powershell
& $node scripts\build.cjs
```

Expected: build exits with code 0 and generated home and Projects pages contain `.cover-title` elements.

- [ ] **Step 2: Run the complete test suite**

Run:

```powershell
& $node --test tests\*.test.js
git diff --check
```

Expected: all tests PASS and `git diff --check` reports no errors.

- [ ] **Step 3: Visually inspect representative pages**

Open the generated home and Projects pages at desktop and mobile widths. Verify one light cover, one dark cover, a short title, and a long title. Titles must remain centered, white, at most two lines, readable, and must not alter link interaction or image proportions.

- [ ] **Step 4: Commit generated pages and push**

```powershell
git add assets/styles.css scripts/project-build.cjs tests/project-build.test.js index.html projects.html projects
git commit -m "feat: add centered titles to project covers"
git push origin main
```

Expected: local `HEAD` and `origin/main` resolve to the same commit.
