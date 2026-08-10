const fs = require("node:fs");
const path = require("node:path");
const projects = require("../data/projects.cjs");
const { buildSite } = require("./project-build.cjs");

buildSite({ rootDir: path.resolve(__dirname, ".."), projects, fs, path });
