const REQUIRED_FIELDS = [
  "slug", "title", "background", "poster", "video", "imageAlt",
  "type", "service", "search", "recommendedProjects",
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

function validateProjects(projects) {
  const slugs = new Set();
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

function renderProjectCard(project, prefix = "") {
  const href = `${prefix}projects/${escapeHtml(project.slug)}/`;
  return `      <a class="project-card reveal" href="${href}" data-type="${escapeHtml(project.type)}" data-service="${escapeHtml(project.service)}" data-search="${escapeHtml(project.search)}">
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
        <button type="button" data-project-filter="3C &amp; Tech">3C &amp; Tech</button>
        <button type="button" data-project-filter="Automotive">Automotive</button>
        <button type="button" data-project-filter="FMCG">FMCG</button>
        <button type="button" data-project-filter="Beauty &amp; Fashion">Beauty &amp; Fashion</button>
        <button type="button" data-project-filter="Short film">Short film</button>
      </div>
      <div class="browse-panel" data-browse-panel="service" hidden>
        <button type="button" data-project-filter="AI-Generated">AI-Generated</button>
        <button type="button" data-project-filter="CG&amp;VFX">CG&amp;VFX</button>
        <button type="button" data-project-filter="Online">Online</button>
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
    <section class="project-player" data-project-player>
      <video poster="../../${escapeHtml(project.poster)}" data-video-src="../../${escapeHtml(project.video)}" preload="metadata" playsinline controls aria-label="${escapeHtml(project.title)} video"></video>
      <button class="project-play-button" type="button" data-play-project aria-label="Play ${escapeHtml(project.title)}"><span aria-hidden="true"></span></button>
      <div class="project-video-error" data-video-error role="alert" hidden>Video could not be loaded. <button type="button" data-video-retry>Try again</button></div>
    </section>
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
  fs.writeFileSync(path.join(rootDir, "projects.html"), renderProjectsPage(projects));
  for (const project of projects) {
    const outputDirectory = path.resolve(rootDir, "projects", project.slug);
    const projectRoot = path.resolve(rootDir, "projects");
    if (!outputDirectory.startsWith(`${projectRoot}${path.sep}`)) {
      throw new Error(`invalid project output path: ${project.slug}`);
    }
    fs.mkdirSync(outputDirectory, { recursive: true });
    const recommendations = selectRecommendations(project.slug, projects);
    fs.writeFileSync(path.join(outputDirectory, "index.html"), renderProjectDetail(project, recommendations));
  }
}

module.exports = {
  buildSite,
  escapeHtml,
  renderProjectCard,
  renderProjectDetail,
  renderProjectsPage,
  selectRecommendations,
  validateProjects,
};
