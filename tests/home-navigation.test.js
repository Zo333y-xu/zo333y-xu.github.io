const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "assets", "styles.css"), "utf8");
const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
const projectsPage = fs.readFileSync(path.join(root, "projects.html"), "utf8");
const placeholderSvg = fs.readFileSync(path.join(root, "assets", "images", "project-placeholder.svg"), "utf8");
const catalog = require("../data/projects.cjs");
const placeholderPath = "assets/images/project-placeholder.svg";

function cssRule(selector) {
  const start = css.indexOf(selector);
  assert.notEqual(start, -1, `Missing CSS selector: ${selector}`);
  const open = css.indexOf("{", start);
  assert.notEqual(open, -1, `Missing opening brace for: ${selector}`);
  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") depth -= 1;
    if (depth === 0) return css.slice(open + 1, index);
  }
  assert.fail(`Missing closing brace for: ${selector}`);
}

function hasCssDeclaration(selector, declaration) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...css.matchAll(new RegExp(`${escapedSelector}\\s*\\{([^{}]*)\\}`, "g"))]
    .some((match) => declaration.test(match[1]));
}

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

const workPanels = [...home.matchAll(/<a class="work-panel reveal" href="([^"]+)"[^>]*>\s*<img src="([^"]+)" alt="([^"]+)"([^>]*)>/g)];
assert.equal(workPanels.length, 10, "Home page must render ten featured project panels.");
for (const [, href] of workPanels) {
  assert.match(href, /^projects\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/);
}
assert.doesNotMatch(home, /home-project-02\.jpg/);

assert.doesNotMatch(home, /class="home-project-title"/);
assert.doesNotMatch(css, /\.home-project-title/);

assert.equal(
  (home.match(/class="work-panel-caption"/g) || []).length,
  catalog.filter((project) => project.featuredOrder !== null && project.poster === placeholderPath).length,
  "Every placeholder home panel needs a visible project-specific caption.",
);
assert.match(
  cssRule('.work-panel[data-placeholder] .work-panel-caption'),
  /position:\s*absolute;/,
  "Placeholder captions must be visible in the base desktop/touch presentation.",
);

assert.equal(
  (projectsPage.match(/class="project-card reveal"[^>]*data-placeholder/g) || []).length,
  catalog.filter((project) => project.poster === placeholderPath).length,
  "Every placeholder Projects card must identify itself as a placeholder tile.",
);
const placeholderTitleRule = cssRule(".project-card[data-placeholder] .project-title");
assert.match(placeholderTitleRule, /position:\s*absolute;/);
assert.doesNotMatch(placeholderTitleRule, /clip:\s*rect|width:\s*1px|height:\s*1px/);

assert.doesNotMatch(home, /data-home-video/);
assert.doesNotMatch(home, /home-hero-poster\.jpg/);

const introRule = cssRule(".site-intro");
assert.match(introRule, /position:\s*fixed;/, "The intro must stay fixed above the site.");
assert.match(introRule, /inset:\s*0;/, "The intro must cover the full viewport.");
assert.match(introRule, /min-height:\s*100dvh;/, "The intro must cover the dynamic viewport.");
assert.match(introRule, /background:\s*var\(--black\);/, "The intro needs a black fallback surface.");
assert.match(introRule, /transition:\s*opacity\b/, "The intro must fade out instead of disappearing abruptly.");

const introVideoRule = cssRule(".site-intro video");
assert.match(introVideoRule, /width:\s*100%;/);
assert.match(introVideoRule, /height:\s*100%;/);
assert.match(introVideoRule, /object-fit:\s*cover;/, "The intro video must cover its viewport without distortion.");

assert.match(cssRule(".intro-scroll-lock"), /overflow:\s*hidden;/, "The intro must lock background scrolling.");
assert.match(cssRule(".site-intro.is-finished"), /opacity:\s*0;/, "The finished intro must fade away.");
assert.match(cssRule(".site-intro-skip"), /position:\s*absolute;/, "Skip must remain visibly positioned over the intro.");
assert.match(cssRule(".site-intro-skip:focus-visible"), /outline:\s*2px\s+solid\s+var\(--white\);/, "Skip needs a visible keyboard focus ring.");

const workPanelRule = cssRule(".home-projects .work-panel");
assert.match(workPanelRule, /min-height:\s*100vh;/, "Home panels need a legacy viewport-height fallback.");
assert.match(workPanelRule, /min-height:\s*100dvh;/, "Each home panel must occupy at least the dynamic viewport.");
assert.match(cssRule(".home-projects .work-panel img"), /object-fit:\s*cover;/, "Home images must cover their full-viewport panels.");

assert.match(cssRule(".projects-grid"), /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/, "Projects must use two columns by default.");
assert.match(
  css,
  /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*?\.projects-grid\s*\{[\s\S]*?grid-template-columns:\s*1fr;/,
  "Projects must collapse to one column at or below 760px.",
);
assert.match(
  css,
  /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*?\.site-header--over-image \.primary-nav\s*\{[\s\S]*?top:\s*64px;[\s\S]*?left:\s*16px;[\s\S]*?justify-content:\s*center;/,
  "Mobile home navigation must occupy its own centered row below the logo.",
);
assert.match(
  css,
  /@media\s*\(max-width:\s*760px\)\s*\{[\s\S]*?\.projects-header \.primary-nav\s*\{[\s\S]*?top:\s*52px;[\s\S]*?left:\s*16px;[\s\S]*?justify-content:\s*center;/,
  "Mobile Projects navigation must not overlap the centered logo.",
);
assert.match(
  css,
  /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.site-intro[\s\S]*?transition:\s*none\s*!important;/,
  "Reduced-motion mode must remove the intro transition.",
);

function channel(value) {
  const normalized = value / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function contrastRatio(hex, background = "#ffffff") {
  const rgb = (color) => [1, 3, 5].map((index) => Number.parseInt(color.slice(index, index + 2), 16));
  const luminance = (color) => {
    const [red, green, blue] = rgb(color).map(channel);
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const first = luminance(hex);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

const gray = css.match(/--gray:\s*(#[0-9a-f]{6});/i)?.[1];
assert.ok(gray, "The shared gray token must be a six-digit hex color.");
assert.ok(
  contrastRatio(gray) >= 4.5,
  `Interactive gray labels need at least 4.5:1 contrast on white; received ${contrastRatio(gray).toFixed(2)}:1.`,
);
for (const selector of [".browse-tab", ".browse-panel button", ".browse-panel--search input::placeholder", ".footer-cta a", ".social-links a"]) {
  assert.ok(hasCssDeclaration(selector, /color:\s*var\(--gray\);/), `${selector} must use the AA gray token.`);
}

const viewBox = placeholderSvg.match(/viewBox="0 0 (\d+) (\d+)"/);
assert.ok(viewBox, "Placeholder SVG must expose a numeric viewBox.");
const [, sourceWidthText, sourceHeightText] = viewBox;
const sourceWidth = Number(sourceWidthText);
const sourceHeight = Number(sourceHeightText);
const mobileWidth = 390;
const mobileHeight = 844;
const coverScale = Math.max(mobileWidth / sourceWidth, mobileHeight / sourceHeight);
const visibleSourceWidth = mobileWidth / coverScale;
const visibleLeft = (sourceWidth - visibleSourceWidth) / 2;
const visibleRight = visibleLeft + visibleSourceWidth;
const textBoxes = [...placeholderSvg.matchAll(/<text[^>]*x="([\d.]+)"[^>]*textLength="([\d.]+)"/g)]
  .map((match) => ({ center: Number(match[1]), width: Number(match[2]) }));
assert.ok(textBoxes.length >= 3, "Placeholder artwork must use explicit text bounds for crop verification.");
for (const box of textBoxes) {
  assert.ok(
    box.center - box.width / 2 >= visibleLeft && box.center + box.width / 2 <= visibleRight,
    `Placeholder text from ${box.center - box.width / 2} to ${box.center + box.width / 2} must survive a centered 390x844 cover crop (${visibleLeft.toFixed(1)} to ${visibleRight.toFixed(1)}).`,
  );
}

console.log("Home navigation regression checks passed.");
