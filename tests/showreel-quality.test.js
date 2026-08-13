const test = require("node:test");
const assert = require("node:assert/strict");
const { statSync } = require("node:fs");
const { join } = require("node:path");

test("showreel uses the approved high-quality GitHub Pages size window", () => {
  const bytes = statSync(join(__dirname, "..", "assets", "videos", "showreel.mp4")).size;
  assert.ok(bytes >= 85_000_000, `showreel is still over-compressed: ${bytes} bytes`);
  assert.ok(bytes < 100_000_000, `showreel exceeds GitHub's file limit: ${bytes} bytes`);
});
