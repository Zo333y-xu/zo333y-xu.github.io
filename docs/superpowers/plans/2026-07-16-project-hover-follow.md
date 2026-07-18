# Project Hover Label Follow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every Project card hover label follow the pointer while remaining inside the image.

**Architecture:** A small pointer interaction in `assets/site.js` writes card-local CSS coordinates. Existing CSS renders the label at those coordinates and keeps the keyboard-focus fallback centered.

**Tech Stack:** Static HTML, CSS custom properties, vanilla JavaScript Pointer Events, Node test runner, Playwright.

## Global Constraints

- Preserve the exact label text `OPEN / watch / see case`.
- Keep the clean Space Travel image and all existing filtering behavior.
- Offset the label by 14 pixels and clamp it inside each card.
- Ignore touch pointer movement and keep keyboard focus accessible.

---

### Task 1: Pointer-follow Project hover label

**Files:**
- Modify: `tests/site.test.mjs`
- Modify: `assets/site.js`
- Modify: `assets/styles.css`

**Interfaces:**
- Consumes: `.project-card` and its `.project-hover` child.
- Produces: `--project-hover-x` and `--project-hover-y` CSS custom properties on each card.

- [ ] **Step 1: Write the failing browser test**

Add a browser test that moves the mouse across the first Project card, verifies that the label position changes, and confirms its right and bottom edges remain within the card.

```js
test("project hover label follows the pointer and remains inside the card", async (t) => {
  const { server, origin } = await startServer();
  t.after(() => server.close());
  const browser = await chromium.launch({ headless: true, executablePath: installedChrome });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${origin}/projects.html`);
  const card = page.locator(".project-card").first();
  const label = card.locator(".project-hover");
  const cardBox = await card.boundingBox();
  await page.mouse.move(cardBox.x + 80, cardBox.y + 80);
  const first = await label.boundingBox();
  await page.mouse.move(cardBox.x + cardBox.width - 4, cardBox.y + cardBox.height - 4);
  const second = await label.boundingBox();
  assert.ok(second.x > first.x);
  assert.ok(second.y > first.y);
  assert.ok(second.x + second.width <= cardBox.x + cardBox.width + 1);
  assert.ok(second.y + second.height <= cardBox.y + cardBox.height + 1);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test --test-name-pattern "project hover label follows" tests/site.test.mjs
```

Expected: FAIL because the label remains fixed at the top-right corner.

- [ ] **Step 3: Implement pointer tracking**

In `assets/site.js`, attach pointer handlers before the browse-tab early return:

```js
document.querySelectorAll(".project-card").forEach((card) => {
  const label = card.querySelector(".project-hover");
  if (!label) return;
  card.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    const bounds = card.getBoundingClientRect();
    const halfWidth = label.offsetWidth / 2;
    const halfHeight = label.offsetHeight / 2;
    const x = Math.min(Math.max(event.clientX - bounds.left + 14 + halfWidth, halfWidth + 8), bounds.width - halfWidth - 8);
    const y = Math.min(Math.max(event.clientY - bounds.top + 14 + halfHeight, halfHeight + 8), bounds.height - halfHeight - 8);
    card.style.setProperty("--project-hover-x", `${x}px`);
    card.style.setProperty("--project-hover-y", `${y}px`);
  });
  card.addEventListener("pointerleave", () => {
    card.style.removeProperty("--project-hover-x");
    card.style.removeProperty("--project-hover-y");
  });
});
```

In `assets/styles.css`, remove fixed top-right positioning and use centered coordinate variables:

```css
.project-hover {
  top: var(--project-hover-y, 50%);
  left: var(--project-hover-x, 50%);
  transform: translate(-50%, calc(-50% - 6px));
}

.project-card:hover .project-hover,
.project-card:focus-visible .project-hover {
  opacity: 1;
  transform: translate(-50%, -50%);
}

@media (hover: none) {
  .project-hover { display: none; }
}
```

- [ ] **Step 4: Run focused and complete tests**

Run the focused test, then `node --test tests/site.test.mjs`.

Expected: focused test PASS and complete suite PASS with 0 failures.

- [ ] **Step 5: Build and commit**

Run `node scripts/build.mjs`, then:

```powershell
git add tests/site.test.mjs assets/site.js assets/styles.css
git commit -m "Make project hover labels follow pointer"
```

