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
  return Array.from({ length: 23 }, (_, index) => ({
    ...validProject,
    slug: `project-${index + 1}`,
    poster: "assets/images/project-placeholder.svg",
    video: null,
    featuredOrder: index < 10 ? index + 1 : null,
    ...overrides,
  }));
}

function catalogWithProject(overrides, index = 0) {
  const catalog = completeCatalog();
  catalog[index] = { ...catalog[index], ...overrides };
  return catalog;
}

function writeCatalogMedia(rootDir, catalog) {
  const assetPaths = new Set(catalog.flatMap((project) => [project.poster, project.video].filter(Boolean)));
  for (const assetPath of assetPaths) {
    const outputPath = path.join(rootDir, ...assetPath.split("/"));
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, "test media");
  }
}

test("validateProjects accepts a complete featured catalog", () => {
  assert.doesNotThrow(() => validateProjects(completeCatalog()));
});

test("validateProjects rejects duplicate slugs", () => {
  const catalog = catalogWithProject({ slug: "project-1" }, 1);
  assert.throws(
    () => validateProjects(catalog),
    /duplicate slug: project-1/,
  );
});

test("validateProjects identifies a missing required field", () => {
  assert.throws(
    () => validateProjects(catalogWithProject({ titleZh: "" })),
    /project-1: missing titleZh/,
  );
});

test("validateProjects rejects noncanonical or duplicate featured metadata", () => {
  assert.throws(
    () => validateProjects(catalogWithProject({ services: ["AI-Generated"] })),
    /project-1: invalid services/,
  );
  assert.throws(
    () => validateProjects(catalogWithProject({ featuredOrder: 1 }, 1)),
    /duplicate featuredOrder/,
  );
  assert.throws(
    () => validateProjects(catalogWithProject({ featuredOrder: 11 })),
    /project-1: invalid featuredOrder/,
  );
  assert.throws(
    () => validateProjects(catalogWithProject({ featuredOrder: null })),
    /featuredOrder values must cover 1 through 10/,
  );
});

test("validateProjects rejects catalogs smaller or larger than 23 projects", () => {
  const catalog = completeCatalog();
  assert.throws(() => validateProjects(catalog.slice(0, -1)), /catalog must contain exactly 23 projects/);
  assert.throws(
    () => validateProjects([...catalog, { ...catalog.at(-1), slug: "project-24" }]),
    /catalog must contain exactly 23 projects/,
  );
});

test("validateProjects only accepts null or non-empty video strings", () => {
  for (const [field, value] of [["video", ""], ["video", 1]]) {
    assert.throws(
      () => validateProjects(catalogWithProject({ [field]: value })),
      new RegExp(`project-1: invalid ${field}`),
    );
  }
  assert.doesNotThrow(() => validateProjects(completeCatalog({ video: null, sourceUrl: null })));
});

test("validateProjects accepts only null or valid HTTPS source URLs", () => {
  assert.doesNotThrow(() => validateProjects(completeCatalog({ sourceUrl: "https://example.com/watch?campaign=summer" })));
  assert.doesNotThrow(() => validateProjects(completeCatalog({ sourceUrl: null })));

  for (const sourceUrl of ["javascript:alert(1)", "http://example.com", "not a URL", "", 1, {}]) {
    assert.throws(
      () => validateProjects(completeCatalog({ sourceUrl })),
      /project-1: invalid sourceUrl/,
    );
  }
});

test("validateProjects requires normalized repository-local poster and MP4 paths", () => {
  assert.doesNotThrow(() => validateProjects(completeCatalog({
    poster: "assets/images/project-placeholder.svg",
    video: "assets/videos/project-preview.mp4",
  })));

  for (const poster of [
    "https://example.com/poster.jpg",
    "../assets/images/poster.jpg",
    "assets/images/../videos/poster.jpg",
    "assets\\images\\poster.jpg",
    "assets/videos/poster.jpg",
  ]) {
    assert.throws(() => validateProjects(catalogWithProject({ poster })), /project-1: invalid poster/);
  }

  for (const video of [
    "https://www.xinpianchang.com/a13700638",
    "../assets/videos/project.mp4",
    "assets/videos/../images/project.mp4",
    "assets\\videos\\project.mp4",
    "assets/images/project.mp4",
    "assets/videos/project.webm",
    "assets/videos/nested/project.mp4",
  ]) {
    assert.throws(() => validateProjects(catalogWithProject({ video })), /project-1: invalid video/);
  }
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

test("catalog search text includes every assigned canonical service", () => {
  for (const project of projects) {
    for (const service of project.services) {
      assert.ok(
        project.search.toLowerCase().includes(service.toLowerCase()),
        `${project.slug} search must include ${service}`,
      );
    }
  }
});

test("supplied projects use their verified web media", () => {
  const expectedMedia = {
    showreel: ["assets/images/showreel-cover.png", "assets/videos/showreel.mp4"],
    "huawei-freebuds-pro-3": ["assets/images/huawei-freebuds-pro-3-cover.png", "assets/videos/huawei-freebuds-pro-3.mp4"],
    "huawei-nora-band-10": ["assets/images/huawei-nora-band-10-cover.png", "assets/videos/huawei-nora-band-10.mp4"],
    "sanrio-brand-2025": ["assets/images/sanrio-brand-2025-cover.jpg", "assets/videos/sanrio-brand-2025.mp4"],
    "friso-x-volvo": ["assets/images/friso-x-volvo-cover.jpg", "assets/videos/friso-x-volvo.mp4"],
    cubee: ["assets/images/cubee-cover.jpg", "assets/videos/cubee.mp4"],
    "universal-studio": ["assets/images/universal-studio-cover.jpg", "assets/videos/universal-studio.mp4"],
    "huawei-watch-fit-5-niki": ["assets/images/huawei-watch-fit-5-niki-cover.png", "assets/videos/huawei-watch-fit-5-niki.mp4"],
    "anta-milan": ["assets/images/anta-milan-cover.png", "assets/videos/anta-milan.mp4"],
    "honor-x-fifa": ["assets/images/honor-x-fifa-cover.png", "assets/videos/honor-x-fifa.mp4"],
    "lays-cny-campaign": ["assets/images/lays-cny-campaign-cover.png", "assets/videos/lays-cny-campaign.mp4"],
    "touareg-x-wu-jing": ["assets/images/touareg-x-wu-jing-cover.png", "assets/videos/touareg-x-wu-jing.mp4"],
  };

  for (const [slug, [poster, video]] of Object.entries(expectedMedia)) {
    const project = projects.find((item) => item.slug === slug);
    assert.equal(project.poster, poster, `${slug} poster`);
    assert.equal(project.video, video, `${slug} video`);
  }
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

test("automatic recommendations rank Type, shared Services, then catalog distance", () => {
  const catalog = completeCatalog();
  const current = catalog[0];
  current.type = "3C & Tech";
  current.services = ["CG & VFX", "Online"];
  current.recommendedProjects = [];

  catalog[1] = { ...catalog[1], type: "3C & Tech", services: ["Online"] };
  catalog[2] = { ...catalog[2], type: "3C & Tech", services: ["CG & VFX", "Online"] };
  catalog[3] = { ...catalog[3], type: "FMCG", services: ["CG & VFX", "Online"] };

  assert.deepEqual(
    selectRecommendations(current.slug, catalog, 3).map((project) => project.slug),
    [catalog[2].slug, catalog[1].slug, catalog[3].slug],
  );
});

test("placeholder project cards render a visible project-specific caption", () => {
  const html = renderProjectCard({
    ...validProject,
    title: "HUAWEI FreeBuds Pro 3",
    titleZh: "领听原声 不同凡响",
    poster: "assets/images/project-placeholder.svg",
  });

  assert.match(html, /data-placeholder/);
  assert.match(html, /class="project-title"/);
  assert.match(html, />HUAWEI FreeBuds Pro 3</);
  assert.match(html, />领听原声 不同凡响</);
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

test("missing-video media does not render a dangerous source URL", () => {
  const html = renderProjectMedia({ ...validProject, video: null, sourceUrl: "javascript:alert(1)" });

  assert.doesNotMatch(html, /<a\s/);
  assert.doesNotMatch(html, /javascript:/i);
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

test("real-video media refuses non-local or non-MP4 sources even if rendering is called directly", () => {
  for (const video of ["https://www.xinpianchang.com/a13700638", "../outside.mp4", "assets/videos/project.webm"]) {
    assert.throws(() => renderProjectMedia({ ...validProject, video }), /invalid video/);
  }
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
  assert.equal(niki.video, "assets/videos/huawei-watch-fit-5-niki.mp4");
  assert.equal(niki.poster, "assets/images/huawei-watch-fit-5-niki-cover.png");
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
    title: "HUAWEI FreeBuds Pro 3",
    poster: "assets/images/project-placeholder.svg",
    imageAlt: "Floating earbuds in a silver case",
  }, { lazy: true });

  assert.match(html, /class="work-panel reveal"/);
  assert.match(html, /href="projects\/huawei-freebuds-pro-3\/"/);
  assert.match(html, /src="assets\/images\/project-placeholder\.svg"/);
  assert.match(html, /alt="Floating earbuds in a silver case"/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /data-placeholder/);
  assert.match(html, /class="work-panel-caption">HUAWEI FreeBuds Pro 3</);
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
  const catalog = completeCatalog();
  writeCatalogMedia(tempRoot, catalog);
  const writes = [];
  const trackingFs = {
    ...fs,
    writeFileSync(file, content) {
      writes.push(path.relative(tempRoot, file));
      return fs.writeFileSync(file, content);
    },
  };

  try {
    buildSite({ rootDir: tempRoot, projects: catalog, fs: trackingFs, path });
    assert.equal(writes[0], "index.html");
    assert.equal(writes[1], "projects.html");
    const home = fs.readFileSync(path.join(tempRoot, "index.html"), "utf8");
    assert.equal((home.match(/class="work-panel reveal"/g) || []).length, 10);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("buildSite prunes stale project directories without touching files outside projects", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "white-pix-build-"));
  const catalog = completeCatalog();
  writeCatalogMedia(tempRoot, catalog);
  const staleDirectory = path.join(tempRoot, "projects", "stale-project");
  const outsideFile = path.join(tempRoot, "keep-me.txt");

  fs.mkdirSync(staleDirectory, { recursive: true });
  fs.writeFileSync(path.join(staleDirectory, "index.html"), "stale");
  fs.writeFileSync(outsideFile, "keep");

  try {
    buildSite({ rootDir: tempRoot, projects: catalog, fs, path });

    assert.equal(fs.existsSync(staleDirectory), false);
    assert.equal(fs.readFileSync(outsideFile, "utf8"), "keep");
    assert.deepEqual(
      fs.readdirSync(path.join(tempRoot, "projects"), { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort(),
      catalog.map((project) => project.slug).sort(),
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("buildSite rejects wrong catalog counts before filesystem mutations", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "white-pix-build-"));
  const mutations = [];
  const trackingFs = {
    ...fs,
    mkdirSync(...args) { mutations.push("mkdir"); return fs.mkdirSync(...args); },
    rmSync(...args) { mutations.push("rm"); return fs.rmSync(...args); },
    writeFileSync(...args) { mutations.push("write"); return fs.writeFileSync(...args); },
  };

  try {
    const catalog = completeCatalog();
    assert.throws(
      () => buildSite({ rootDir: tempRoot, projects: catalog.slice(0, -1), fs: trackingFs, path }),
      /catalog must contain exactly 23 projects/,
    );
    assert.throws(
      () => buildSite({ rootDir: tempRoot, projects: [...catalog, { ...catalog.at(-1), slug: "project-24" }], fs: trackingFs, path }),
      /catalog must contain exactly 23 projects/,
    );
    assert.deepEqual(mutations, []);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("buildSite rejects missing poster or video files before output mutations", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "white-pix-build-"));
  const mutations = [];
  const trackingFs = {
    ...fs,
    mkdirSync(...args) { mutations.push("mkdir"); return fs.mkdirSync(...args); },
    rmSync(...args) { mutations.push("rm"); return fs.rmSync(...args); },
    writeFileSync(...args) { mutations.push("write"); return fs.writeFileSync(...args); },
  };

  try {
    assert.throws(
      () => buildSite({ rootDir: tempRoot, projects: completeCatalog(), fs: trackingFs, path }),
      /project-1: missing poster asset/,
    );
    assert.deepEqual(mutations, []);

    writeCatalogMedia(tempRoot, completeCatalog());
    mutations.length = 0;
    assert.throws(
      () => buildSite({
        rootDir: tempRoot,
        projects: catalogWithProject({ video: "assets/videos/project-1.mp4" }),
        fs: trackingFs,
        path,
      }),
      /project-1: missing video asset/,
    );
    assert.deepEqual(mutations, []);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

function createDirectoryLinkOrSkip(t, target, link) {
  try {
    fs.symlinkSync(target, link, process.platform === "win32" ? "junction" : "dir");
  } catch (error) {
    if (error.code === "EPERM" || error.code === "EACCES" || error.code === "ENOTSUP") {
      t.skip(`directory links unavailable: ${error.code}`);
      return false;
    }
    throw error;
  }
  return true;
}

test("buildSite rejects a linked project root without touching its external target", (t) => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "white-pix-build-"));
  const catalog = completeCatalog();
  writeCatalogMedia(tempRoot, catalog);
  const externalRoot = fs.mkdtempSync(path.join(os.tmpdir(), "white-pix-external-"));
  const projectRoot = path.join(tempRoot, "projects");
  const sentinel = path.join(externalRoot, "sentinel.txt");
  fs.writeFileSync(sentinel, "outside");

  try {
    if (!createDirectoryLinkOrSkip(t, externalRoot, projectRoot)) return;

    assert.throws(
      () => buildSite({ rootDir: tempRoot, projects: catalog, fs, path }),
      /invalid project root/,
    );
    assert.equal(fs.readFileSync(sentinel, "utf8"), "outside");
    assert.equal(fs.existsSync(path.join(externalRoot, "project-1")), false);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
    fs.rmSync(externalRoot, { recursive: true, force: true });
  }
});

test("buildSite rejects linked project children without touching their external target", (t) => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "white-pix-build-"));
  const catalog = completeCatalog();
  writeCatalogMedia(tempRoot, catalog);
  const externalRoot = fs.mkdtempSync(path.join(os.tmpdir(), "white-pix-external-"));
  const projectRoot = path.join(tempRoot, "projects");
  const linkedChild = path.join(projectRoot, "stale-project");
  const sentinel = path.join(externalRoot, "sentinel.txt");
  fs.mkdirSync(projectRoot, { recursive: true });
  fs.writeFileSync(sentinel, "outside");

  try {
    if (!createDirectoryLinkOrSkip(t, externalRoot, linkedChild)) return;

    assert.throws(
      () => buildSite({ rootDir: tempRoot, projects: catalog, fs, path }),
      /invalid project output link/,
    );
    assert.equal(fs.readFileSync(sentinel, "utf8"), "outside");
    assert.equal(fs.existsSync(path.join(externalRoot, "index.html")), false);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
    fs.rmSync(externalRoot, { recursive: true, force: true });
  }
});

test("buildSite rejects a project root swapped after preflight before external writes", (t) => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "white-pix-build-"));
  const catalog = completeCatalog();
  writeCatalogMedia(tempRoot, catalog);
  const externalRoot = fs.mkdtempSync(path.join(os.tmpdir(), "white-pix-external-"));
  const projectRoot = path.join(tempRoot, "projects");
  const sentinel = path.join(externalRoot, "sentinel.txt");
  fs.mkdirSync(path.join(projectRoot, "stale-project"), { recursive: true });
  fs.writeFileSync(sentinel, "outside");

  let swapped = false;
  const swappingFs = {
    ...fs,
    onProjectPreflight() {
      fs.rmSync(projectRoot, { recursive: true, force: true });
      if (!createDirectoryLinkOrSkip(t, externalRoot, projectRoot)) return;
      swapped = true;
    },
  };

  try {
    assert.throws(
      () => buildSite({ rootDir: tempRoot, projects: catalog, fs: swappingFs, path }),
      /invalid project root|project root changed/,
    );
    if (!swapped) return;
    assert.equal(fs.readFileSync(sentinel, "utf8"), "outside");
    assert.equal(fs.existsSync(path.join(externalRoot, "project-1")), false);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
    fs.rmSync(externalRoot, { recursive: true, force: true });
  }
});

test("buildSite rejects a managed child swapped after preflight before external writes", (t) => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "white-pix-build-"));
  const catalog = completeCatalog();
  writeCatalogMedia(tempRoot, catalog);
  const externalRoot = fs.mkdtempSync(path.join(os.tmpdir(), "white-pix-external-"));
  const projectRoot = path.join(tempRoot, "projects");
  const managedProject = path.join(projectRoot, "project-1");
  const sentinel = path.join(externalRoot, "sentinel.txt");
  fs.mkdirSync(managedProject, { recursive: true });
  fs.writeFileSync(path.join(managedProject, "index.html"), "existing");
  fs.writeFileSync(sentinel, "outside");

  let swapped = false;
  const swappingFs = {
    ...fs,
    onProjectPreflight() {
      fs.rmSync(managedProject, { recursive: true, force: true });
      if (!createDirectoryLinkOrSkip(t, externalRoot, managedProject)) return;
      swapped = true;
    },
  };

  try {
    assert.throws(
      () => buildSite({ rootDir: tempRoot, projects: catalog, fs: swappingFs, path }),
      /invalid project output link|project child changed/,
    );
    if (!swapped) return;
    assert.equal(fs.readFileSync(sentinel, "utf8"), "outside");
    assert.equal(fs.existsSync(path.join(externalRoot, "index.html")), false);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
    fs.rmSync(externalRoot, { recursive: true, force: true });
  }
});
