const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "assets", "styles.css"), "utf8");
const home = fs.readFileSync(path.join(root, "index.html"), "utf8");

for (const [label, href] of [
  ["Projects", "projects.html"],
  ["About", "about.html"],
  ["Contact", "contact.html"],
]) {
  assert.match(home, new RegExp(`<a href="${href}">${label}</a>`));
}

assert.match(
  css,
  /\.site-header--over-image \.brand\s*\{[\s\S]*?top:\s*50%;[\s\S]*?left:\s*50%;[\s\S]*?background:\s*url\("images\/white-pix-logo-white\.png"\)/,
  "The standalone home logo must be centered in the header.",
);

assert.doesNotMatch(
  css,
  /\.site-header--over-image \.primary-nav a:hover[\s\S]*?color:\s*transparent;/,
  "Home navigation labels must remain visible on hover and keyboard focus.",
);

assert.match(
  css,
  /\.site-header--over-image \.primary-nav\s*{[\s\S]*?display:\s*flex;[\s\S]*?color:\s*var\(--white\);/,
  "Home navigation must use the header's vertically centered flex alignment.",
);

assert.match(home, /src="assets\/images\/home-project-01\.jpg"/);

assert.doesNotMatch(home, /class="home-project-title"/);
assert.doesNotMatch(css, /\.home-project-title/);

assert.doesNotMatch(home, /data-home-video/);
assert.doesNotMatch(home, /home-hero-poster\.jpg/);

console.log("Home navigation regression checks passed.");
