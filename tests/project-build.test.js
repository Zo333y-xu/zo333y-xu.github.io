const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const {
  validateProjects,
  selectRecommendations,
  renderProjectCard,
  renderProjectDetail,
} = require("../scripts/project-build.cjs");
const projects = require("../data/projects.cjs");

const validProject = {
  slug: "the-dawn",
  title: "The Dawn",
  background: "A surreal carnival film.",
  poster: "assets/images/projects-card-01.jpg",
  video: "assets/videos/the-dawn.mp4",
  imageAlt: "A surreal carnival scene",
  type: "Short film",
  service: "Online",
  search: "The Dawn carnival film",
  recommendedProjects: ["space-travel"],
};

test("validateProjects accepts complete unique records", () => {
  assert.doesNotThrow(() => validateProjects([validProject]));
});

test("validateProjects rejects duplicate slugs", () => {
  assert.throws(
    () => validateProjects([validProject, { ...validProject }]),
    /duplicate slug: the-dawn/,
  );
});

test("validateProjects identifies a missing required field", () => {
  assert.throws(
    () => validateProjects([{ ...validProject, video: "" }]),
    /the-dawn: missing video/,
  );
});

test("recommendations preserve valid explicit order and exclude current project", () => {
  const projects = [
    { ...validProject, slug: "a", recommendedProjects: ["c", "a", "missing", "b"] },
    { ...validProject, slug: "b", recommendedProjects: [] },
    { ...validProject, slug: "c", recommendedProjects: [] },
    { ...validProject, slug: "d", recommendedProjects: [] },
  ];
  assert.deepEqual(
    selectRecommendations("a", projects, 3).map((project) => project.slug),
    ["c", "b", "d"],
  );
});

test("recommendations never duplicate a project", () => {
  const projects = [
    { ...validProject, slug: "a", recommendedProjects: ["b", "b"] },
    { ...validProject, slug: "b", recommendedProjects: [] },
    { ...validProject, slug: "c", recommendedProjects: [] },
  ];
  assert.deepEqual(
    selectRecommendations("a", projects, 3).map((project) => project.slug),
    ["b", "c"],
  );
});

test("project cards link to independent directory URLs", () => {
  const html = renderProjectCard(validProject);
  assert.match(html, /href="projects\/the-dawn\/"/);
  assert.match(html, /data-type="Short film"/);
  assert.match(html, /data-service="Online"/);
  assert.doesNotMatch(html, /href="#"/);
});

test("detail page contains accessible lazy MP4 player and project content", () => {
  const html = renderProjectDetail(validProject, [
    { ...validProject, slug: "space-travel", title: "Space Travel" },
  ]);
  assert.match(html, /<title>The Dawn \| White Pix<\/title>/);
  assert.match(html, /poster="\.\.\/\.\.\/assets\/images\/projects-card-01\.jpg"/);
  assert.match(html, /preload="metadata"/);
  assert.match(html, /playsinline/);
  assert.match(html, /aria-label="Play The Dawn"/);
  assert.match(html, /<h2>Background<\/h2>/);
  assert.match(html, /href="\.\.\/space-travel\/"/);
});

test("detail player exposes the browser-script contract", () => {
  const html = renderProjectDetail(validProject, []);
  for (const attribute of [
    "data-project-player",
    "data-video-src",
    "data-play-project",
    "data-video-error",
    "data-video-retry",
  ]) assert.match(html, new RegExp(attribute));
  assert.match(html, /assets\/project-detail\.js/);
  assert.equal(fs.existsSync(path.join(__dirname, "..", "assets", "project-detail.js")), true);
});

test("detail page uses root-relative page links from a project directory", () => {
  const html = renderProjectDetail(validProject, []);
  assert.match(html, /href="\.\.\/\.\.\/contact\.html">Get in touch!/);
});

test("detail-page stylesheet includes responsive player and recommendation rules", () => {
  const css = fs.readFileSync(path.join(__dirname, "..", "assets", "styles.css"), "utf8");
  assert.match(css, /\.project-detail-page/);
  assert.match(css, /\.project-player/);
  assert.match(css, /\.browse-more-grid/);
  assert.match(css, /@media \(max-width: 760px\)[\s\S]*?\.browse-more-grid/);
});

test("AUDI project is updated to MICHELIN with automotive recommendations", () => {
  const project = projects.find((item) => item.slug === "audi");
  assert.equal(project.title, "MICHELIN");
  assert.equal(project.poster, "assets/images/michelin-cover.jpg");
  assert.equal(project.video, "assets/videos/michelin-4k.mp4");
  assert.equal(project.type, "Automotive");
  assert.equal(project.recommendedProjects[0], "space-travel");
  assert.match(project.background, /Summer road trips face slippery rainy roads/);
});

test("Golden Hour project is updated to SANRIO with Beauty & Fashion recommendations", () => {
  const project = projects.find((item) => item.slug === "golden-hour");
  assert.equal(project.title, "SANRIO");
  assert.equal(project.poster, "assets/images/sanrio-cover.jpg");
  assert.equal(project.video, "assets/videos/sanrio.mp4");
  assert.equal(project.type, "Beauty & Fashion");
  assert.equal(project.recommendedProjects[0], "urban-silence");
  assert.match(project.background, /Escape city hustle after work/);
});

test("Urban Silence project is updated to Space Homestead with 3C recommendations", () => {
  const project = projects.find((item) => item.slug === "urban-silence");
  assert.equal(project.title, "Space Homestead");
  assert.equal(project.poster, "assets/images/space-homestead-cover.jpg");
  assert.equal(project.video, "assets/videos/space-homestead-1080p.mp4");
  assert.equal(project.type, "3C & Tech");
  assert.equal(project.recommendedProjects[0], "elf");
  assert.match(project.background, /our first sci-fi brand film created for Sunseeker Robotics/);
});
