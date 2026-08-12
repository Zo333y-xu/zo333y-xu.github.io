const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const os = require("node:os");

const {
  SERVICE_VALUES,
  TYPE_VALUES,
  validateProjects,
  selectRecommendations,
  renderProjectCard,
  renderProjectDetail,
  renderProjectMedia,
  renderHomePage,
  renderHomeProject,
  renderProjectsPage,
  selectFeaturedProjects,
  buildSite,
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

test("project cards serialize every assigned service for independent directory URLs", () => {
  const html = renderProjectCard({ ...validProject, services: ["AIGC", "CG & VFX"] });
  assert.match(html, /href="projects\/the-dawn\/"/);
  assert.match(html, /data-type="Short Film"/);
  assert.match(html, /data-services="AIGC\|CG &amp; VFX"/);
  assert.doesNotMatch(html, /data-service="/);
  assert.doesNotMatch(html, /href="#"/);
});

test("projects page lists canonical service filters in display order", () => {
  const html = renderProjectsPage([validProject]);
  const servicePanel = html.match(/data-browse-panel="service"[\s\S]*?<\/div>/)?.[0] || "";
  const labels = [...servicePanel.matchAll(/data-project-filter="([^"]+)"/g)]
    .map((match) => match[1]);

  assert.deepEqual(labels, ["AIGC", "CG &amp; VFX", "2D Animation", "Online"]);
  assert.doesNotMatch(html, /AI-Generated|CG&amp;VFX/);
});

test("missing-video detail page renders a safe poster fallback", () => {
  const html = renderProjectDetail({ ...validProject, video: null, sourceUrl: "https://example.com/watch" }, []);

  assert.match(html, /class="project-player project-player--fallback"/);
  assert.match(html, /<img src="\.\.\/\.\.\/assets\/images\/projects-card-01\.jpg" alt="A surreal carnival scene">/);
  assert.match(html, />Video coming soon</);
  assert.doesNotMatch(html, /<video|data-video-src|src=""/);
});

test("missing-video media escapes and secures an optional source link", () => {
  const html = renderProjectMedia({
    ...validProject,
    video: null,
    sourceUrl: "https://example.com/watch?title=The%20Dawn&from=portfolio",
  });

  assert.match(html, /href="https:\/\/example\.com\/watch\?title=The%20Dawn&amp;from=portfolio"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.doesNotMatch(html, /<iframe|<embed|<object/);
});

test("missing-video media omits the source link when no source URL exists", () => {
  const html = renderProjectMedia({ ...validProject, video: null, sourceUrl: null });

  assert.match(html, />Video coming soon</);
  assert.doesNotMatch(html, /<a\s/);
});

test("real-video media retains the lazy player script contract", () => {
  const html = renderProjectMedia(validProject);

  for (const attribute of [
    "data-project-player",
    "data-video-src=\"../../assets/videos/the-dawn.mp4\"",
    "data-play-project",
    "data-video-error",
    "data-video-retry",
  ]) assert.match(html, new RegExp(attribute));
  assert.match(html, /<video[^>]*poster="\.\.\/\.\.\/assets\/images\/projects-card-01\.jpg"/);
  assert.match(html, /preload="metadata"/);
  assert.match(html, /playsinline/);
  assert.match(html, /aria-label="Play The Dawn"/);
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

test("featured home projects are exactly the ten catalog entries sorted by featuredOrder", () => {
  const featured = selectFeaturedProjects([
    { ...validProject, slug: "third", featuredOrder: 3 },
    { ...validProject, slug: "unfeatured", featuredOrder: null },
    { ...validProject, slug: "first", featuredOrder: 1 },
    { ...validProject, slug: "second", featuredOrder: 2 },
  ]);

  assert.deepEqual(featured.map((project) => project.slug), ["first", "second", "third"]);
});

test("home project panel uses direct detail links, project poster and image alt text", () => {
  const html = renderHomeProject({
    ...validProject,
    slug: "huawei-freebuds-pro-3",
    poster: "assets/images/project-placeholder.svg",
    imageAlt: "Floating earbuds in a silver case",
  }, { lazy: true });

  assert.match(html, /class="work-panel reveal"/);
  assert.match(html, /href="projects\/huawei-freebuds-pro-3\/"/);
  assert.match(html, /src="assets\/images\/project-placeholder\.svg"/);
  assert.match(html, /alt="Floating earbuds in a silver case"/);
  assert.match(html, /loading="lazy"/);
  assert.doesNotMatch(html, /href="projects\.html"/);
});

test("home page renders the first featured image eagerly and remaining panels lazily", () => {
  const html = renderHomePage(completeCatalog().reverse());
  const panels = [...html.matchAll(/<a class="work-panel reveal"[\s\S]*?<\/a>/g)];

  assert.equal(panels.length, 10);
  assert.match(panels[0][0], /href="projects\/project-1\/"/);
  assert.doesNotMatch(panels[0][0], /loading="lazy"/);
  for (const panel of panels.slice(1)) assert.match(panel[0], /loading="lazy"/);
});

test("buildSite writes the generated home page before projects and detail pages", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "white-pix-build-"));
  const writes = [];
  const trackingFs = {
    ...fs,
    writeFileSync(file, content) {
      writes.push(path.relative(tempRoot, file));
      return fs.writeFileSync(file, content);
    },
  };

  try {
    buildSite({ rootDir: tempRoot, projects: completeCatalog(), fs: trackingFs, path });
    assert.equal(writes[0], "index.html");
    assert.equal(writes[1], "projects.html");
    const home = fs.readFileSync(path.join(tempRoot, "index.html"), "utf8");
    assert.equal((home.match(/class="work-panel reveal"/g) || []).length, 10);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
