const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const contact = fs.readFileSync(path.join(root, "contact.html"), "utf8");
const css = fs.readFileSync(path.join(root, "assets", "styles.css"), "utf8");
const { renderProjectDetail } = require("../scripts/project-build.cjs");

function assertSocialFooter(html, prefix = "") {
  assert.match(html, new RegExp(`href="${prefix}wechat\\.html"`));
  assert.match(html, new RegExp(`src="${prefix}assets/images/wechat\\.png"`));
  assert.match(html, new RegExp(`src="${prefix}assets/images/red\\.png"`));
  assert.match(html, new RegExp(`src="${prefix}assets/images/douyin\\.png"`));
  assert.match(html, /xiaohongshu\.com\/user\/profile\/65364473000000000400a626/);
  assert.match(html, /douyin\.com\/user\/MS4wLjABAAAAcszi43pbG_Ef4HTyMmNwJZc-UYjCK3RsE0J2__UGPseuyxfeyyUE4cEnCqvr2Adz/);
}

test("contact footer exposes three safe new-tab social links", () => {
  assert.match(contact, /href="wechat\.html"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*aria-label="White Pix on WeChat"/);
  assert.match(contact, /href="https:\/\/www\.xiaohongshu\.com\/user\/profile\/65364473000000000400a626[^\"]*"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*aria-label="White Pix on Xiaohongshu"/);
  assert.match(contact, /href="https:\/\/www\.douyin\.com\/user\/MS4wLjABAAAAcszi43pbG_Ef4HTyMmNwJZc-UYjCK3RsE0J2__UGPseuyxfeyyUE4cEnCqvr2Adz\?from_tab_name=main"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*aria-label="White Pix on Douyin"/);

  for (const image of ["wechat.png", "red.png", "douyin.png"]) {
    assert.match(contact, new RegExp(`src="assets/images/${image.replace(".", "\\.")}"`));
    assert.equal(fs.existsSync(path.join(root, "assets", "images", image)), true);
  }
});

test("contact Keep in touch text exposes three safe new-tab social links", () => {
  assert.match(contact, /href="wechat\.html"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*aria-label="White Pix on WeChat"[^>]*>WECHAT<\/a>/);
  assert.match(contact, /href="https:\/\/www\.xiaohongshu\.com\/user\/profile\/65364473000000000400a626[^\"]*"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*aria-label="White Pix on Xiaohongshu"[^>]*>RED<\/a>/);
  assert.match(contact, /href="https:\/\/www\.douyin\.com\/user\/MS4wLjABAAAAcszi43pbG_Ef4HTyMmNwJZc-UYjCK3RsE0J2__UGPseuyxfeyyUE4cEnCqvr2Adz\?from_tab_name=main"[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*aria-label="White Pix on Douyin"[^>]*>DOUYIN<\/a>/);
});

test("contact email row remains present with no published address", () => {
  assert.match(contact, /<dt>E-mail<\/dt>\s*<dd><\/dd>/);
  assert.doesNotMatch(contact, /whitepixl@vip\.com/i);
});

test("WeChat page presents the supplied QR image in a centered viewport", () => {
  const wechat = fs.readFileSync(path.join(root, "wechat.html"), "utf8");
  assert.match(wechat, /class="wechat-qr-page"/);
  assert.match(wechat, /src="assets\/images\/wechat-qr\.jpg"/);
  assert.match(wechat, /alt="WeChat QR code for White Pix"/);
  assert.equal(fs.existsSync(path.join(root, "assets", "images", "wechat-qr.jpg")), true);
  assert.match(css, /\.wechat-qr-page\s*\{[\s\S]*?display:\s*grid;[\s\S]*?place-items:\s*center;[\s\S]*?min-height:\s*100(?:vh|svh);/);
});

test("every top-level public footer exposes the three social icons", () => {
  for (const page of ["index.html", "about.html", "projects.html"]) {
    assertSocialFooter(fs.readFileSync(path.join(root, page), "utf8"));
  }
});

test("generated project footers use root-relative social assets", () => {
  const project = {
    slug: "sample",
    title: "Sample",
    background: "Sample background",
    poster: "assets/images/sample.jpg",
    video: null,
    sourceUrl: null,
    imageAlt: "Sample poster",
    type: "Automotive",
    services: ["VFX"],
    search: "Sample",
    recommendedProjects: [],
  };
  assertSocialFooter(renderProjectDetail(project, []), "../../");
});
