# Showreel Quality Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the compressed Showreel asset with a clearer 1080p H.264 encode that remains publishable through GitHub Pages.

**Architecture:** Keep the existing project data, URL, poster, and player unchanged. Add a focused binary-quality regression test, re-encode directly from the verified master into the existing asset path, then run local and production playback verification.

**Tech Stack:** Node.js test runner, FFmpeg H.264 encoder, static HTML/CSS/JavaScript, GitHub Pages.

## Global Constraints

- Output resolution must remain 1920×1080 at 25 fps.
- Target video bitrate is 5–5.5 Mbps; audio is AAC 128 Kbps.
- Output must use H.264, yuv420p, and faststart.
- Final file must be below GitHub's 100,000,000-byte per-file limit, with 85–95 MB as the target.
- Keep `assets/videos/showreel.mp4` and all existing page URLs unchanged.

---

### Task 1: Add the Showreel publishing-size quality gate

**Files:**
- Create: `tests/showreel-quality.test.js`
- Test: `tests/showreel-quality.test.js`

**Interfaces:**
- Consumes: `assets/videos/showreel.mp4` as the production binary.
- Produces: a persistent Node test that prevents the low-bitrate 60.9 MB asset or a GitHub-rejected 100 MB asset from being published.

- [ ] **Step 1: Write the failing test**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const { statSync } = require("node:fs");
const { join } = require("node:path");

test("showreel uses the approved high-quality GitHub Pages size window", () => {
  const bytes = statSync(join(__dirname, "..", "assets", "videos", "showreel.mp4")).size;
  assert.ok(bytes >= 85_000_000, `showreel is still over-compressed: ${bytes} bytes`);
  assert.ok(bytes < 100_000_000, `showreel exceeds GitHub's file limit: ${bytes} bytes`);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
& 'C:\Users\xuziw\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests/showreel-quality.test.js
```

Expected: FAIL with `showreel is still over-compressed: 60984065 bytes`.

- [ ] **Step 3: Commit the failing quality contract together with the later passing asset**

Do not commit during RED; continue to Task 2 so the branch never records a knowingly failing production state.

### Task 2: Re-encode the verified master

**Files:**
- Modify: `assets/videos/showreel.mp4`
- Source only: `.superpowers/incoming/01-showreel/01-showreel/0625_BC_CG Showreel.m4v`
- Test: `tests/showreel-quality.test.js`

**Interfaces:**
- Consumes: the verified 1920×1080, 25 fps, approximately 9.85 Mbps master.
- Produces: the existing `/assets/videos/showreel.mp4` public asset at higher visual quality.

- [ ] **Step 1: Encode to a temporary MP4**

Use the available FFmpeg binary and a supported H.264 encoder. Prefer `h264_nvenc` with High profile; if hardware initialization fails, use `h264_mf` with the same rate controls.

```powershell
$ffmpeg = 'C:\Program Files (x86)\ACLOS\Cross\recorder-release\ffmpeg.exe'
$source = '.superpowers\incoming\01-showreel\01-showreel\0625_BC_CG Showreel.m4v'
$output = 'assets\videos\showreel.high-quality.mp4'
& $ffmpeg -y -hide_banner -i $source -map '0:v:0' -map '0:a:0?' -c:v h264_nvenc -profile:v high -b:v 5200k -maxrate 5500k -bufsize 10400k -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart $output
```

- [ ] **Step 2: Inspect metadata and exact size before replacement**

Run:

```powershell
& $ffmpeg -hide_banner -i $output 2>&1 | Select-String 'Duration|Stream #'
Get-Item $output | Select-Object Length
```

Expected: 1920×1080, 25 fps H.264, AAC audio, and 85,000,000–99,999,999 bytes. If the file is outside the window, adjust only `-b:v` within 5000k–5500k and repeat.

- [ ] **Step 3: Replace the existing asset**

```powershell
Move-Item -LiteralPath $output -Destination 'assets\videos\showreel.mp4' -Force
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run the Task 1 command.

Expected: 1 test passes.

- [ ] **Step 5: Run all regressions and build**

```powershell
& 'C:\Users\xuziw\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test tests/*.test.js
& 'C:\Users\xuziw\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/build.cjs
```

Expected: every test passes and the build exits 0.

- [ ] **Step 6: Verify local browser metadata and playback**

Open `/projects/showreel/`, start the player, and assert `readyState >= 1`, `videoWidth === 1920`, `videoHeight === 1080`, and `duration > 0` in desktop Chrome.

- [ ] **Step 7: Commit the test and replacement asset**

```powershell
git add tests/showreel-quality.test.js assets/videos/showreel.mp4
git commit -m "fix: improve showreel playback quality"
```

### Task 3: Publish and verify production

**Files:**
- No additional production files.

**Interfaces:**
- Consumes: the verified commit from Task 2.
- Produces: the same production Showreel URL with the higher-quality binary.

- [ ] **Step 1: Push the feature branch and merge it into `main` through GitHub**

Require the remote head to match the locally verified commit before merge.

- [ ] **Step 2: Wait for GitHub Pages propagation**

Poll `https://zo333y-xu.github.io/assets/videos/showreel.mp4` until it returns 200 with the new content length.

- [ ] **Step 3: Verify the production player**

Open `https://zo333y-xu.github.io/projects/showreel/` in desktop Chrome, start playback, and confirm 1920×1080 metadata, positive duration, no page errors, and no HTTP responses at or above 400.

- [ ] **Step 4: Record the deployed commit and final evidence**

Report the production URL, merge SHA, exact file size, video metadata, full test count, and browser result.
