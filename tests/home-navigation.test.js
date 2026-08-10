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
  /\.site-header--over-image \.brand,[\s\S]*?\.site-header--over-image \.primary-nav\s*\{\s*color:\s*var\(--white\);/,
  "Home navigation and brand must remain visible over the hero image.",
);

assert.match(
  css,
  /\.site-header--over-image \.primary-nav\s*{[\s\S]*?position:\s*absolute;[\s\S]*?grid-template-columns:\s*4\.2vw 3\.4vw 4\.25vw 2\.15vw;[\s\S]*?right:\s*\.4vw;/,
  "Home navigation hit targets must align with the labels baked into the hero image.",
);

assert.match(home, /class="home-project-title"/);
assert.match(home, /Space Travel/);
assert.match(home, /BY BAO/);
assert.match(css, /\.home-project-title/);

assert.doesNotMatch(home, /data-home-video/);
assert.doesNotMatch(home, /home-hero-poster\.jpg/);

console.log("Home navigation regression checks passed.");
