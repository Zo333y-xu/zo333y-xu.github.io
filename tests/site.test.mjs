import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { existsSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const testDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(testDir, "..");

async function text(file) {
  return readFile(path.join(siteDir, file), "utf8");
}

async function startServer() {
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".jpg": "image/jpeg",
    ".png": "image/png",
  };
  const server = http.createServer(async (request, response) => {
    const clean = decodeURIComponent(request.url.split("?")[0]);
    const relative = clean === "/" ? "index.html" : clean.replace(/^\//, "");
    const target = path.resolve(siteDir, relative);
    if (!target.startsWith(siteDir)) {
      response.writeHead(403).end();
      return;
    }
    try {
      const info = await stat(target);
      if (!info.isFile()) throw new Error("not a file");
      response.writeHead(200, { "content-type": types[path.extname(target)] || "application/octet-stream" });
      createReadStream(target).pipe(response);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

test("ships the three requested HTML pages with shared navigation", async () => {
  for (const file of ["index.html", "projects.html", "about.html"]) {
    const html = await text(file);
    assert.match(html, /<meta name="viewport"/);
    assert.match(html, /href="index\.html"/);
    assert.match(html, /href="projects\.html"/);
    assert.match(html, /href="about\.html"/);
    assert.match(html, /assets\/styles\.css/);
  }
});

test("matches the supplied page structure", async () => {
  const home = await text("index.html");
  const projects = await text("projects.html");
  const about = await text("about.html");
  assert.equal((home.match(/class="work-panel/g) || []).length, 8);
  assert.equal((projects.match(/class="project-card/g) || []).length, 6);
  assert.match(projects, /data-browse-tab="type"/);
  assert.match(projects, /data-browse-tab="service"/);
  assert.doesNotMatch(projects, /data-browse-tab="media"/);
  assert.match(projects, /data-browse-tab="search"/);
  assert.match(about, /CREATIVE LAB\./);
  assert.match(about, /Who we are/);
  assert.match(about, /Clients &amp; Collaborations/);
});

test("ships the supplied contact, about, and social assets", async () => {
  const expected = {
    "assets/images/contact-map-2026.png": 250000,
    "assets/images/about-studio-detail.png": 1500000,
    "assets/images/social-icons-cn.png": 100,
  };
  for (const [file, minimumSize] of Object.entries(expected)) {
    assert.equal(existsSync(path.join(siteDir, file)), true, `${file} should exist`);
    assert.ok((await stat(path.join(siteDir, file))).size > minimumSize, `${file} should be fully present`);
  }
});

test("defines responsive and reduced-motion behavior", async () => {
  const css = await text("assets/styles.css");
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(css, /#[0-9a-f]{6}[^\n]*purple/i);
});

test("keeps browse subcategory text aligned with the menu type scale", async () => {
  const css = await text("assets/styles.css");
  assert.match(css, /\.browse-panel button\s*\{[^}]*font-size:\s*14px/s);
  assert.match(css, /@media \(max-width: 980px\)[\s\S]*?\.browse-panel button\s*\{[^}]*font-size:\s*12px/s);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.browse-panel button\s*\{[^}]*font-size:\s*11px/s);
});

test("keeps project search text aligned with the menu type scale", async () => {
  const css = await text("assets/styles.css");
  assert.match(css, /\.browse-panel--search input\s*\{[^}]*font-size:\s*14px/s);
  assert.match(css, /@media \(max-width: 980px\)[\s\S]*?\.browse-panel--search input\s*\{[^}]*font-size:\s*12px/s);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.browse-panel--search input\s*\{[^}]*font-size:\s*11px/s);
});

test("aligns browse labels and keeps primary navigation weights consistent", async () => {
  const css = await text("assets/styles.css");
  assert.match(css, /\.browse-nav > strong,\s*\.browse-tab\s*\{[^}]*height:\s*30px[^}]*line-height:\s*30px/s);
  assert.match(css, /\.primary-nav a,\s*\.language-button\s*\{[^}]*font-weight:\s*700/s);
});

test("shifts the About introduction column to the right to match the supplied layout", async () => {
  const css = await text("assets/styles.css");
  assert.match(css, /\.about-copy\s*\{[^}]*width:\s*min\(980px,\s*58%\)[^}]*margin-left:\s*clamp\(220px,\s*22vw,\s*420px\)/s);
  assert.match(css, /\.about-detail\s*\{[^}]*width:\s*min\(980px,\s*58%\)[^}]*margin-left:\s*clamp\(220px,\s*22vw,\s*420px\)/s);
  assert.match(css, /\.clients h2\s*\{[^}]*width:\s*min\(980px,\s*58%\)[^}]*margin-left:\s*clamp\(220px,\s*22vw,\s*420px\)/s);
});

test("renders client logos as a three-lane alternating marquee", async () => {
  const about = await text("about.html");
  const css = await text("assets/styles.css");
  assert.equal((about.match(/class="logo-marquee(?:\s|")/g) || []).length, 3);
  assert.equal((about.match(/class="logo-marquee__track/g) || []).length, 6);
  assert.match(css, /@keyframes logo-marquee-left/);
  assert.match(css, /@keyframes logo-marquee-right/);
  assert.match(css, /prefers-reduced-motion: reduce[\s\S]*?\.logo-marquee__track[\s\S]*?animation:\s*none/s);
});

test("connects the site navigation to a dedicated contact page", async () => {
  for (const file of ["index.html", "projects.html", "about.html"]) {
    const html = await text(file);
    assert.match(html, /href="contact\.html"/);
  }
  const contact = await text("contact.html");
  assert.match(contact, /<meta name="viewport"/);
  assert.match(contact, /<h1>CONTACT<\/h1>/);
  assert.match(contact, /Address/);
  assert.match(contact, /href="tel:/);
  assert.match(contact, /href="mailto:/);
  assert.match(contact, /contact-map-2026\.png/);
});

test("routes every Get in touch CTA to the contact page", async () => {
  for (const file of ["index.html", "projects.html", "about.html", "contact.html"]) {
    const html = await text(file);
    const links = [...html.matchAll(/<a\s+href="([^"]+)"[^>]*>Get in touch!<\/a>/g)];
    for (const link of links) assert.equal(link[1], "contact.html", `${file} CTA should open contact.html`);
  }
});

test("shows permanent project titles from the supplied layout", async () => {
  const projects = await text("projects.html");
  assert.equal((projects.match(/class="project-title"/g) || []).length, 6);
  for (const label of ["The Dawn", "BY AKI", "Space Travel", "BY BAO", "Urban Silence", "BY CHIAN", "Golden Hour", "BY ZOEC", "elf", "BY GUIN", "AUDI", "BY ZACK"]) {
    assert.match(projects, new RegExp(`>${label}<`));
  }
});

test("uses the clean Space Travel artwork while preserving hover labels", async () => {
  const projects = await text("projects.html");
  assert.match(projects, /assets\/images\/projects-card-02-clean\.jpg/);
  assert.equal((projects.match(/class="project-hover"/g) || []).length, 6);
  assert.match(projects, />OPEN <span>watch<br>see case<\/span><\/span>/);
});

test("uses the supplied Contact map as the responsive map source", async () => {
  const contact = await text("contact.html");
  const css = await text("assets/styles.css");
  assert.match(contact, /assets\/images\/contact-map-2026\.png/);
  assert.match(css, /\.contact-map > img\s*\{/);
});

test("uses the refreshed Contact details and map", async () => {
  const contact = await text("contact.html");
  assert.match(contact, /3RD FLOOR, NO\. 553, MAOTAI ROAD/);
  assert.match(contact, /CHANGNING DISTRICT, SHANGHAI, CHINA/);
  assert.match(contact, /www\.whitepixl\.com/);
  assert.match(contact, />WECHAT</);
  assert.match(contact, />RED</);
  assert.match(contact, />DOUYIN</);
  assert.match(contact, /assets\/images\/contact-map-2026\.png/);
});

test("uses the supplied Chinese social icon strip on every page", async () => {
  for (const file of ["index.html", "projects.html", "about.html", "contact.html"]) {
    const html = await text(file);
    assert.match(html, /class="social-icons-image"/);
    assert.doesNotMatch(html, /class="social-links"/);
  }
});

test("provides the Worker and static assets required by Sites", async () => {
  const pkg = JSON.parse(await text("package.json"));
  const build = await text("scripts/build.mjs");
  assert.equal(pkg.scripts.build, "node scripts/build.mjs");
  assert.match(build, /dist[\\/]server[\\/]index\.js/);
  assert.match(build, /dist[\\/]client/);
  for (const page of ["index.html", "projects.html", "about.html", "contact.html"]) {
    assert.match(build, new RegExp(page.replace(".", "\\.")));
  }
});

test("browse tabs and project search work in the browser", async (t) => {
  const { server, origin } = await startServer();
  t.after(() => server.close());
  const installedChrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const browser = await chromium.launch({
    headless: true,
    executablePath: existsSync(installedChrome) ? installedChrome : undefined,
  });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(`${origin}/index.html`);
  assert.equal(await page.locator(".work-panel").count(), 8);

  await page.goto(`${origin}/projects.html`);
  await page.locator('[data-browse-tab="service"]').click();
  assert.equal(await page.locator('[data-browse-panel="service"]:not([hidden])').count(), 1);
  await page.locator('[data-browse-tab="search"]').click();
  await page.locator("#project-search").fill("Audi");
  assert.equal(await page.locator('.project-card:not([hidden])').count(), 1);

  await page.goto(`${origin}/about.html`);
  assert.match(await page.locator("h1").innerText(), /CREATIVE LAB\.\s+EXPERIMENTAL/);
});

test("project hover label follows the pointer and remains inside the card", async (t) => {
  const { server, origin } = await startServer();
  t.after(() => server.close());
  const installedChrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const browser = await chromium.launch({
    headless: true,
    executablePath: existsSync(installedChrome) ? installedChrome : undefined,
  });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(`${origin}/projects.html`);
  const card = page.locator(".project-card").first();
  const label = card.locator(".project-hover");
  const cardBox = await card.boundingBox();
  assert.ok(cardBox);

  await page.mouse.move(cardBox.x + 80, cardBox.y + 80);
  const first = await label.boundingBox();
  assert.ok(first);

  await page.mouse.move(cardBox.x + cardBox.width - 4, cardBox.y + cardBox.height - 4);
  const second = await label.boundingBox();
  assert.ok(second);

  assert.ok(second.x > first.x + 20);
  assert.ok(second.y > first.y + 20);
  assert.ok(second.x + second.width <= cardBox.x + cardBox.width + 1);
  assert.ok(second.y + second.height <= cardBox.y + cardBox.height + 1);
});
