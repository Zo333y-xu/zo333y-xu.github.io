const TYPE_VALUES = ["3C & Tech", "Automotive", "FMCG", "Beauty & Fashion", "Short Film"];
const SERVICE_VALUES = ["AIGC", "CG & VFX", "2D Animation", "Online"];
const REQUIRED_FIELDS = [
  "slug", "title", "titleZh", "background", "poster", "imageAlt",
  "type", "services", "search", "recommendedProjects",
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[character]));
}

function isHttpsUrl(value) {
  if (typeof value !== "string" || value.trim() !== value || value === "") return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isResolvedChildPath(parentPath, childPath, path) {
  const relativePath = path.relative(parentPath, childPath);
  return relativePath !== "" && relativePath !== ".." && !relativePath.startsWith(`..${path.sep}`) && !path.isAbsolute(relativePath);
}

function validateProjects(projects) {
  const slugs = new Set();
  const featuredOrders = [];
  for (const project of projects) {
    for (const field of REQUIRED_FIELDS) {
      const value = project[field];
      if (value === "" || value == null || (field === "recommendedProjects" && !Array.isArray(value))) {
        throw new Error(`${project.slug || "unknown project"}: missing ${field}`);
      }
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) {
      throw new Error(`${project.slug}: invalid slug`);
    }
    if (slugs.has(project.slug)) throw new Error(`duplicate slug: ${project.slug}`);
    slugs.add(project.slug);

    if (typeof project.client !== "string") throw new Error(`${project.slug}: invalid client`);
    if (!Number.isInteger(project.year)) throw new Error(`${project.slug}: invalid year`);
    if (project.video !== null && (typeof project.video !== "string" || project.video.trim() === "")) {
      throw new Error(`${project.slug}: invalid video`);
    }
    if (project.sourceUrl !== null && !isHttpsUrl(project.sourceUrl)) {
      throw new Error(`${project.slug}: invalid sourceUrl`);
    }
    if (!TYPE_VALUES.includes(project.type)) throw new Error(`${project.slug}: invalid type`);
    if (!Array.isArray(project.services) || project.services.length < 1 || project.services.length > 3) {
      throw new Error(`${project.slug}: invalid services`);
    }
    if (new Set(project.services).size !== project.services.length || project.services.some((service) => !SERVICE_VALUES.includes(service))) {
      throw new Error(`${project.slug}: invalid services`);
    }
    if (project.featuredOrder !== null) {
      if (!Number.isInteger(project.featuredOrder) || project.featuredOrder < 1 || project.featuredOrder > 10) {
        throw new Error(`${project.slug}: invalid featuredOrder`);
      }
      featuredOrders.push(project.featuredOrder);
    }
  }
  if (new Set(featuredOrders).size !== featuredOrders.length) {
    throw new Error("duplicate featuredOrder");
  }
  if (featuredOrders.length !== 10) {
    throw new Error("featuredOrder values must cover 1 through 10");
  }
}

function selectRecommendations(currentSlug, projects, limit = 3) {
  const current = projects.find((project) => project.slug === currentSlug);
  if (!current) throw new Error(`unknown project: ${currentSlug}`);

  const bySlug = new Map(projects.map((project) => [project.slug, project]));
  const selected = [];
  const seen = new Set([currentSlug]);

  for (const slug of [...current.recommendedProjects, ...projects.map((project) => project.slug)]) {
    if (seen.has(slug) || !bySlug.has(slug)) continue;
    seen.add(slug);
    selected.push(bySlug.get(slug));
    if (selected.length === limit) break;
  }

  return selected;
}

function selectFeaturedProjects(projects) {
  return projects
    .filter((project) => project.featuredOrder !== null)
    .sort((first, second) => first.featuredOrder - second.featuredOrder);
}

function renderHomeProject(project, options = {}) {
  const loading = options.lazy ? ' loading="lazy"' : "";
  return `    <a class="work-panel reveal" href="projects/${escapeHtml(project.slug)}/" aria-label="${escapeHtml(project.title)}">
      <img src="${escapeHtml(project.poster)}" alt="${escapeHtml(project.imageAlt)}"${loading}>
    </a>`;
}

function renderHomePage(projects) {
  const panels = selectFeaturedProjects(projects)
    .map((project, index) => renderHomeProject(project, { lazy: index > 0 }))
    .join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="White Pix creative post-production studio.">
  <title>White Pix | Creative Post-Production</title>
  <link rel="stylesheet" href="assets/styles.css">
  <script src="assets/site.js" defer></script>
  <script src="assets/intro-gate.js" defer></script>
</head>
<body class="home-page intro-scroll-lock">
  <section class="site-intro" data-intro aria-label="Site introduction">
    <video data-intro-video src="assets/videos/site-intro.mp4" muted autoplay playsinline preload="auto"></video>
    <button type="button" data-intro-skip>Skip</button>
  </section>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header site-header--over-image" data-header>
    <a class="brand" href="index.html" aria-label="White Pix home">white pixl</a>
    <nav class="primary-nav" aria-label="Primary navigation">
      <a href="projects.html">Projects</a>
      <a href="about.html">About</a>
      <a href="contact.html">Contact</a>
      <button class="language-button" type="button" aria-label="Current language: English">En</button>
    </nav>
  </header>

  <main id="main" class="home-projects">
${panels}
  </main>

  ${renderFooter()}
</body>
</html>`;
}

function renderProjectCard(project, prefix = "") {
  const href = `${prefix}projects/${escapeHtml(project.slug)}/`;
  return `      <a class="project-card reveal" href="${href}" data-type="${escapeHtml(project.type)}" data-services="${escapeHtml(project.services.join("|"))}" data-search="${escapeHtml(project.search)}">
        <img src="${prefix}${escapeHtml(project.poster)}" alt="${escapeHtml(project.imageAlt)}" loading="lazy">
        <span class="project-title"><span>${escapeHtml(project.title)}</span></span>
        <span class="project-hover">OPEN <span>watch<br>see case</span></span>
      </a>`;
}

function renderProjectsPage(projects) {
  const cards = projects.map((project) => renderProjectCard(project)).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Selected White Pix post-production projects.">
  <title>Projects | White Pix</title>
  <link rel="stylesheet" href="assets/styles.css">
  <script src="assets/site.js" defer></script>
</head>
<body class="projects-page">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header site-header--light projects-header">
    <div class="browse-nav" aria-label="Browse projects">
      <strong>BROWSE BY</strong>
      <button class="browse-tab is-active" type="button" data-browse-tab="all" aria-selected="true">All</button>
      <button class="browse-tab" type="button" data-browse-tab="type" aria-selected="false">Type</button>
      <button class="browse-tab" type="button" data-browse-tab="service" aria-selected="false">Service</button>
      <button class="browse-tab" type="button" data-browse-tab="search" aria-selected="false">Search</button>
    </div>
    <a class="brand" href="index.html" aria-label="White Pix home">white pixl</a>
    <nav class="primary-nav" aria-label="Primary navigation">
      <a class="is-current" href="projects.html">Projects</a>
      <a href="about.html">About</a>
      <a href="contact.html">Contact</a>
      <button class="language-button" type="button" aria-label="Current language: English">En</button>
    </nav>
  </header>
  <main id="main">
    <section class="browse-stage" aria-live="polite">
      <div class="browse-panel" data-browse-panel="type" hidden>
${TYPE_VALUES.map((type) => `        <button type="button" data-project-filter="${escapeHtml(type)}">${escapeHtml(type)}</button>`).join("\n")}
      </div>
      <div class="browse-panel" data-browse-panel="service" hidden>
${SERVICE_VALUES.map((service) => `        <button type="button" data-project-filter="${escapeHtml(service)}">${escapeHtml(service)}</button>`).join("\n")}
      </div>
      <div class="browse-panel browse-panel--search" data-browse-panel="search" hidden>
        <label class="sr-only" for="project-search">Search projects</label>
        <input id="project-search" type="search" placeholder="Search for anything" autocomplete="off">
      </div>
      <p class="filter-status" data-filter-status></p>
    </section>
    <section class="projects-grid" aria-label="Selected projects">
${cards}
    </section>
  </main>
  ${renderFooter()}
</body>
</html>`;
}

function renderFooter(prefix = "") {
  return `<footer class="site-footer" id="contact">
    <div class="footer-cta"><span>Start from a single pixel.</span><a href="${prefix}contact.html">Get in touch!</a></div>
    <div class="footer-bottom">
      <p>White Pix is an international creative post-production<br>company with offices in Shanghai China.<br><a href="mailto:info@whitepixl.com">info@whitepixl.com</a></p>
      <div class="social-icons-image" role="img" aria-label="WeChat, Xiaohongshu and Douyin"></div>
    </div>
  </footer>`;
}

function renderRecommendation(project) {
  return `      <a class="browse-more-card" href="../${escapeHtml(project.slug)}/">
        <img src="../../${escapeHtml(project.poster)}" alt="${escapeHtml(project.imageAlt)}" loading="lazy">
        <span>${escapeHtml(project.title)}</span>
      </a>`;
}

function renderProjectMedia(project) {
  if (project.video !== null) {
    return `    <section class="project-player" data-project-player>
      <video poster="../../${escapeHtml(project.poster)}" data-video-src="../../${escapeHtml(project.video)}" preload="metadata" playsinline controls aria-label="${escapeHtml(project.title)} video"></video>
      <button class="project-play-button" type="button" data-play-project aria-label="Play ${escapeHtml(project.title)}"><span aria-hidden="true"></span></button>
      <div class="project-video-error" data-video-error role="alert" hidden>Video could not be loaded. <button type="button" data-video-retry>Try again</button></div>
    </section>`;
  }

  const sourceLink = !isHttpsUrl(project.sourceUrl)
    ? ""
    : `\n        <a class="project-source-link" href="${escapeHtml(project.sourceUrl)}" target="_blank" rel="noopener noreferrer">View source</a>`;

  return `    <section class="project-player project-player--fallback">
      <img src="../../${escapeHtml(project.poster)}" alt="${escapeHtml(project.imageAlt)}">
      <div class="project-player-fallback-content">
        <p>Video coming soon</p>${sourceLink}
      </div>
    </section>`;
}

function renderProjectDetail(project, recommendations) {
  const recommendedCards = recommendations.map(renderRecommendation).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(project.title)} by White Pix.">
  <title>${escapeHtml(project.title)} | White Pix</title>
  <link rel="stylesheet" href="../../assets/styles.css">
  <script src="../../assets/site.js" defer></script>
  <script src="../../assets/project-detail.js" defer></script>
</head>
<body class="project-detail-page">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header site-header--light detail-header">
    <a class="brand" href="../../index.html" aria-label="White Pix home">white pixl</a>
    <nav class="primary-nav" aria-label="Primary navigation">
      <a class="is-current" href="../../projects.html">Projects</a>
      <a href="../../about.html">About</a>
      <a href="../../contact.html">Contact</a>
      <button class="language-button" type="button" aria-label="Current language: English">En</button>
    </nav>
  </header>
  <main id="main">
    <section class="project-intro">
      <h1>${escapeHtml(project.title)}</h1>
    </section>
${renderProjectMedia(project)}
    <section class="project-background">
      <h2>Background</h2>
      <p>${escapeHtml(project.background)}</p>
    </section>
    <section class="browse-more" aria-labelledby="browse-more-heading">
      <h2 id="browse-more-heading">Browse More</h2>
      <div class="browse-more-grid">
${recommendedCards}
      </div>
    </section>
  </main>
  ${renderFooter("../../")}
</body>
</html>`;
}

function buildSite({ rootDir, projects, fs, path }) {
  validateProjects(projects);
  const projectRoot = path.resolve(rootDir, "projects");
  const projectSlugs = new Set(projects.map((project) => project.slug));
  let projectRootStats;
  try {
    projectRootStats = fs.lstatSync(projectRoot);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  if (projectRootStats) {
    if (!projectRootStats.isDirectory() || projectRootStats.isSymbolicLink()) {
      throw new Error("invalid project root");
    }

    const canonicalProjectRoot = fs.realpathSync(projectRoot);
    const expectedProjectRoot = path.resolve(fs.realpathSync(path.resolve(rootDir)), "projects");
    if (path.relative(expectedProjectRoot, canonicalProjectRoot) !== "") {
      throw new Error("invalid project root");
    }

    const projectEntries = fs.readdirSync(projectRoot, { withFileTypes: true });
    for (const entry of projectEntries) {
      const projectPath = path.resolve(projectRoot, entry.name);
      const projectStats = fs.lstatSync(projectPath);
      if (projectStats.isSymbolicLink()) {
        throw new Error(`invalid project output link: ${entry.name}`);
      }
      const canonicalProjectPath = fs.realpathSync(projectPath);
      if (!isResolvedChildPath(canonicalProjectRoot, canonicalProjectPath, path)) {
        throw new Error(`invalid project output link: ${entry.name}`);
      }
    }

    for (const entry of projectEntries) {
      if (!entry.isDirectory() || projectSlugs.has(entry.name)) continue;

      const staleDirectory = path.resolve(projectRoot, entry.name);
      if (!isResolvedChildPath(projectRoot, staleDirectory, path)) {
        throw new Error(`invalid stale project output path: ${entry.name}`);
      }
      fs.rmSync(staleDirectory, { recursive: true, force: false });
    }
  }
  fs.writeFileSync(path.join(rootDir, "index.html"), renderHomePage(projects));
  fs.writeFileSync(path.join(rootDir, "projects.html"), renderProjectsPage(projects));
  for (const project of projects) {
    const outputDirectory = path.resolve(rootDir, "projects", project.slug);
    if (!isResolvedChildPath(projectRoot, outputDirectory, path)) {
      throw new Error(`invalid project output path: ${project.slug}`);
    }
    fs.mkdirSync(outputDirectory, { recursive: true });
    const recommendations = selectRecommendations(project.slug, projects);
    fs.writeFileSync(path.join(outputDirectory, "index.html"), renderProjectDetail(project, recommendations));
  }
}

module.exports = {
  SERVICE_VALUES,
  TYPE_VALUES,
  buildSite,
  escapeHtml,
  renderProjectCard,
  renderProjectDetail,
  renderProjectMedia,
  renderHomePage,
  renderHomeProject,
  renderProjectsPage,
  selectFeaturedProjects,
  selectRecommendations,
  validateProjects,
};
