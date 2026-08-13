# Social Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the contact-page social artwork into three safe new-tab links and add a centered standalone WeChat QR page.

**Architecture:** Keep the static-site architecture. Replace the decorative social background with semantic linked images, and serve the supplied QR image from a minimal standalone HTML page styled by the shared stylesheet.

**Tech Stack:** Static HTML, CSS, PNG/JPG assets, Node.js built-in test runner and assertions.

## Global Constraints

- Preserve the existing lower-right alignment, visual order, spacing, and responsive sizing.
- All three destinations open in a new tab with `rel="noopener noreferrer"`.
- Existing unrelated working-tree edits remain untouched.

---

### Task 1: Social-link and QR-page regression contract

**Files:**
- Create: `tests/social-links.test.js`

**Interfaces:**
- Consumes: `contact.html`, `wechat.html`, `assets/styles.css`, and four named image files.
- Produces: A static regression contract for hrefs, new-tab attributes, accessible labels, asset existence, and centered QR layout.

- [ ] **Step 1: Write the failing test**

```js
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const contact = fs.readFileSync(path.join(root, "contact.html"), "utf8");
const css = fs.readFileSync(path.join(root, "assets", "styles.css"), "utf8");

test("contact footer exposes three safe new-tab social links", () => {
  assert.match(contact, /href="wechat\.html"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*aria-label="White Pix on WeChat"/);
  assert.match(contact, /href="https:\/\/www\.xiaohongshu\.com\/user\/profile\/65364473000000000400a626[^\"]*"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*aria-label="White Pix on Xiaohongshu"/);
  assert.match(contact, /href="https:\/\/www\.douyin\.com\/user\/MS4wLjABAAAAcszi43pbG_Ef4HTyMmNwJZc-UYjCK3RsE0J2__UGPseuyxfeyyUE4cEnCqvr2Adz\?from_tab_name=main"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*aria-label="White Pix on Douyin"/);
  for (const image of ["wechat.png", "red.png", "douyin.png"]) {
    assert.match(contact, new RegExp(`src="assets/images/${image.replace(".", "\\.")}"`));
    assert.equal(fs.existsSync(path.join(root, "assets", "images", image)), true);
  }
});

test("WeChat page presents the supplied QR image in a centered viewport", () => {
  const wechat = fs.readFileSync(path.join(root, "wechat.html"), "utf8");
  assert.match(wechat, /class="wechat-qr-page"/);
  assert.match(wechat, /src="assets\/images\/wechat-qr\.jpg"/);
  assert.match(wechat, /alt="WeChat QR code for White Pix"/);
  assert.equal(fs.existsSync(path.join(root, "assets", "images", "wechat-qr.jpg")), true);
  assert.match(css, /\.wechat-qr-page\s*\{[\s\S]*?display:\s*grid;[\s\S]*?place-items:\s*center;[\s\S]*?min-height:\s*100(?:vh|svh);/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/social-links.test.js`

Expected: FAIL because `wechat.html` and the individual social assets do not exist and `contact.html` has no matching links.

### Task 2: Individual social links and supplied assets

**Files:**
- Modify: `contact.html`
- Modify: `assets/styles.css`
- Create: `assets/images/wechat.png`
- Create: `assets/images/red.png`
- Create: `assets/images/douyin.png`

**Interfaces:**
- Consumes: The three user-supplied icon PNG files and the exact URLs in the approved design.
- Produces: `.social-icons` containing three accessible linked `<img>` elements.

- [ ] **Step 1: Copy the three supplied icons**

Copy `C:/Users/xuziw/Desktop/新logo/wechat.png`, `red.png`, and `douyin.png` into `assets/images/` without altering their bytes.

- [ ] **Step 2: Implement semantic links**

Replace `.social-icons-image` in `contact.html` with `.social-icons` containing three anchors in WeChat, Xiaohongshu, Douyin order. Put `href`, `target="_blank"`, `rel="noopener noreferrer"`, and the matching `aria-label` on each anchor, with a decorative `alt=""` icon inside.

- [ ] **Step 3: Implement responsive icon layout**

Replace `.social-icons-image` rules with a flex `.social-icons` layout, explicit image dimensions matching the supplied icons' proportions, visible keyboard focus, and a mobile width reduction that preserves the current footprint.

- [ ] **Step 4: Run the focused test**

Run: `node --test tests/social-links.test.js`

Expected: FAIL only because `wechat.html` and `wechat-qr.jpg` are still absent.

### Task 3: Centered WeChat QR page

**Files:**
- Create: `wechat.html`
- Modify: `assets/styles.css`
- Create: `assets/images/wechat-qr.jpg`

**Interfaces:**
- Consumes: The user-supplied WeChat QR JPG.
- Produces: `wechat.html`, linked from the WeChat footer icon.

- [ ] **Step 1: Copy the supplied QR image**

Copy `D:/xwechat_files/wxid_mo3c9nf8jys422_6f51/temp/RWTemp/2026-08/bca90f043aa8d4f6471d4cdfe2cfcf0e/f367e07048fddbcd09495f9c5401e978.jpg` to `assets/images/wechat-qr.jpg` without altering its bytes.

- [ ] **Step 2: Create the minimal QR page**

Create a valid responsive HTML document titled `WeChat | White Pix`. Give the body class `wechat-qr-page` and include `<img src="assets/images/wechat-qr.jpg" alt="WeChat QR code for White Pix">` as the only visible content.

- [ ] **Step 3: Center and constrain the QR image**

Add `.wechat-qr-page` shared stylesheet rules using `display: grid`, `place-items: center`, and viewport minimum height. Constrain the image to the viewport with auto height and `object-fit: contain` so it never crops.

- [ ] **Step 4: Run the focused test**

Run: `node --test tests/social-links.test.js`

Expected: PASS.

### Task 4: Full verification

**Files:**
- Verify only; do not alter unrelated files.

**Interfaces:**
- Consumes: Completed static pages, styles, assets, and test suite.
- Produces: Evidence that the feature integrates without regressions.

- [ ] **Step 1: Run all tests**

Run: `npm test`

Expected: all tests PASS with no warnings or errors.

- [ ] **Step 2: Run the static build**

Run: `npm run build`

Expected: exit code 0 with all generated project pages reported.

- [ ] **Step 3: Check the diff**

Run: `git diff --check` and inspect `git diff -- contact.html wechat.html assets/styles.css tests/social-links.test.js`.

Expected: no whitespace errors and only approved feature changes.
