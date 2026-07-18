import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const clientDir = path.join(root, "dist/client");
const workerEntry = path.join(root, "dist/server/index.js");
const hostingDir = path.join(root, "dist/.openai");
const pages = ["index.html", "projects.html", "about.html", "contact.html"];

await rm(dist, { recursive: true, force: true });
await mkdir(clientDir, { recursive: true });
await mkdir(path.dirname(workerEntry), { recursive: true });
await mkdir(hostingDir, { recursive: true });

for (const page of pages) {
  await cp(path.join(root, page), path.join(clientDir, page));
}
await cp(path.join(root, "assets"), path.join(clientDir, "assets"), { recursive: true });
await cp(path.join(root, ".openai/hosting.json"), path.join(hostingDir, "hosting.json"));

const worker = `export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let pathname = url.pathname;
    if (pathname === "/") pathname = "/index.html";
    if (!pathname.includes(".") && !pathname.endsWith("/")) pathname += ".html";

    if (env.ASSETS && typeof env.ASSETS.fetch === "function") {
      const assetUrl = new URL(pathname, request.url);
      const response = await env.ASSETS.fetch(new Request(assetUrl, request));
      if (response.status !== 404) return response;
    }

    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }
};
`;

await writeFile(workerEntry, worker, "utf8");
console.log(`Built ${pages.length} pages into ${dist}`);
