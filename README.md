# White Pix static website

The site is generated from one catalog and can be opened from `index.html` or
served locally. It publishes 23 project records, plus a separate session-once
intro. Ten catalog projects are selected for the full-viewport home sequence.

## Build and test

Install Node.js 20 or newer with npm, then use the same portable commands on
Windows, macOS, or Linux:

```sh
npm test
npm run build
```

The build validates the catalog and its local media before changing generated
output, rewrites the home and Projects pages, reconciles exactly 23 managed
project directories, and regenerates each detail page. Run both commands before
publishing.

## Local preview

```powershell
python -m http.server 8080
```

Open `http://localhost:8080`. The generated pages are `index.html`,
`projects.html`, and `projects/<slug>/index.html`; `about.html` and
`contact.html` remain standalone pages.

## Project catalog schema

All project content lives in `data/projects.cjs`. Every record contains:

- `slug`: unique, stable, lowercase hyphenated URL segment
- `title`, `titleZh`, `client`, `year`, and factual English `background`
- `poster`, nullable local `video`, nullable HTTPS `sourceUrl`, and `imageAlt`
- one canonical `type` and one to three unique canonical `services`
- `search`, nullable `featuredOrder`, and `recommendedProjects` slug list

Canonical Type labels are `3C & Tech`, `Automotive`, `FMCG`,
`Beauty & Fashion`, and `Short Film`. Canonical Service labels, in display
order, are `AIGC`, `CG & VFX`, `2D Animation`, and `Online`.

Do not change an existing `slug` when replacing media or copy. The slug is the
stable public address and may also be referenced by `recommendedProjects`.
Use existing slugs in that list; invalid or repeated entries are skipped and
other projects fill the available Browse More slots.

## Media replacement

The supplied intro source is outside the repository at
`D:\xwechat_files\wxid_mo3c9nf8jys422_6f51\msg\video\2026-08\b891f7949b42d0d7c7d76e621006ce1c.mp4`.
Its published site path is `assets/videos/site-intro.mp4`; only the published
path is referenced by generated HTML. Project media belongs in `assets/images/`
and `assets/videos/`.

When final artwork is unavailable, set `poster` to
`assets/images/project-placeholder.svg`. When a verified local MP4 is
unavailable, set `video: null`; the detail page then renders a proportional,
readable `Video coming soon` fallback and may show the HTTPS `sourceUrl` as an
ordinary external link. To publish final media, replace the placeholder path
with the new local poster path and/or replace `null` with the local MP4 path,
keep the project slug unchanged, and rebuild.
