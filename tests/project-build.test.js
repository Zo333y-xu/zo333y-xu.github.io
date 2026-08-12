const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const {
  SERVICE_VALUES,
  TYPE_VALUES,
  validateProjects,
  selectRecommendations,
  renderProjectCard,
  renderProjectDetail,
} = require("../scripts/project-build.cjs");
const projects = require("../data/projects.cjs");

const validProject = {
  slug: "the-dawn",
  title: "The Dawn",
  titleZh: "黎明",
  client: "",
  year: 2026,
  background: "A surreal carnival film.",
  poster: "assets/images/projects-card-01.jpg",
  video: "assets/videos/the-dawn.mp4",
  sourceUrl: null,
  imageAlt: "A surreal carnival scene",
  type: "Short Film",
  services: ["Online"],
  search: "The Dawn carnival film",
  featuredOrder: null,
  recommendedProjects: ["space-travel"],
};

function completeCatalog(overrides = {}) {
  return Array.from({ length: 10 }, (_, index) => ({
    ...validProject,
    slug: `project-${index + 1}`,
    featuredOrder: index + 1,
    ...overrides,
  }));
}

test("validateProjects accepts a complete featured catalog", () => {
  assert.doesNotThrow(() => validateProjects(completeCatalog()));
});

test("validateProjects rejects duplicate slugs", () => {
  assert.throws(
    () => validateProjects([validProject, { ...validProject }]),
    /duplicate slug: the-dawn/,
  );
});

test("validateProjects identifies a missing required field", () => {
  assert.throws(
    () => validateProjects([{ ...validProject, titleZh: "" }]),
    /the-dawn: missing titleZh/,
  );
});

test("validateProjects rejects noncanonical or duplicate featured metadata", () => {
  assert.throws(
    () => validateProjects([{ ...validProject, services: ["AI-Generated"] }]),
    /the-dawn: invalid services/,
  );
  assert.throws(
    () => validateProjects([
      { ...validProject, slug: "a", featuredOrder: 1 },
      { ...validProject, slug: "b", featuredOrder: 1 },
    ]),
    /duplicate featuredOrder/,
  );
  assert.throws(
    () => validateProjects([{ ...validProject, featuredOrder: 11 }]),
    /the-dawn: invalid featuredOrder/,
  );
  assert.throws(
    () => validateProjects([{ ...validProject, featuredOrder: 1 }]),
    /featuredOrder values must cover 1 through 10/,
  );
});

test("validateProjects only accepts null or non-empty media source strings", () => {
  for (const [field, value] of [["video", ""], ["video", 1], ["sourceUrl", ""], ["sourceUrl", {}]]) {
    assert.throws(
      () => validateProjects([{ ...validProject, [field]: value }]),
      new RegExp(`the-dawn: invalid ${field}`),
    );
  }
  assert.doesNotThrow(() => validateProjects(completeCatalog({ video: null, sourceUrl: null })));
});

test("catalog contains 23 valid projects and ten ordered features", () => {
  assert.equal(projects.length, 23);
  assert.deepEqual(
    projects.filter((project) => project.featuredOrder != null)
      .map((project) => project.featuredOrder).sort((a, b) => a - b),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  );
  assert.doesNotThrow(() => validateProjects(projects));
});

test("catalog uses canonical types and service labels", () => {
  for (const project of projects) {
    assert.ok(TYPE_VALUES.includes(project.type), project.type);
    assert.ok(Array.isArray(project.services));
    assert.ok(project.services.length >= 1 && project.services.length <= 3);
    assert.equal(new Set(project.services).size, project.services.length);
    project.services.forEach((service) => assert.ok(SERVICE_VALUES.includes(service), service));
  }
  assert.doesNotMatch(JSON.stringify(projects), /AI-Generated|CG&VFX/);
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
  assert.match(html, /data-type="Short Film"/);
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

test("catalog preserves Excel project facts and supplied source URLs", () => {
  const showreel = projects.find((item) => item.slug === "showreel");
  const niki = projects.find((item) => item.slug === "huawei-watch-fit-5-niki");
  assert.equal(showreel.titleZh, "混剪");
  assert.equal(showreel.featuredOrder, 1);
  assert.equal(niki.title, "HUAWEI WATCH Fit 5 Niki");
  assert.equal(niki.featuredOrder, 10);
  assert.equal(niki.sourceUrl, "https://www.xinpianchang.com/a13700638?from=UserProfile");
  assert.equal(niki.video, null);
  assert.equal(niki.poster, "assets/images/project-placeholder.svg");
});
