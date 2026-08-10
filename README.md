# White Pix static website

Open `index.html` directly, or run a local static server from this folder.

Example with Python:

```powershell
python -m http.server 8080
```

Then visit `http://localhost:8080`.

Pages:

- `index.html` - Home
- `projects.html` - Projects with Type, Media and Search browsing
- `about.html` - About and clients
- `contact.html` - Contact details and Shanghai studio map

## Adding or replacing a project

All project content lives in `data/projects.cjs`. To add a project, copy its
poster image to `assets/images/`, copy its web-ready H.264/AAC MP4 file to
`assets/videos/`, then add one record with a unique lowercase `slug`.

Required fields are `slug`, `title`, `background`, `poster`, `video`,
`imageAlt`, `type`, `service`, `search`, and `recommendedProjects`. Use
existing slugs in `recommendedProjects`; invalid or repeated slugs are safely
skipped and other projects fill the available Browse More slots.

Run the following before publishing:

```powershell
$node = "C:\Users\xuziw\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
& $node --test tests/*.test.js
& $node scripts/build.cjs
```

The build updates `projects.html` and generates the independent page at
`projects/<slug>/index.html`. To replace an existing video while keeping its
address, replace its MP4 file and rerun the build. Rename the MP4 or add a
version query only when you need browsers to bypass a cached older video.
