const assert = require("node:assert/strict");
const test = require("node:test");

const { matchesProjectFilter } = require("../assets/project-filter.cjs");

const project = {
  type: "FMCG",
  services: ["2D Animation", "Online"],
  search: "Friso x Volvo brand film",
};

test("matches a project when the selected Type is exact", () => {
  assert.equal(matchesProjectFilter(project, "FMCG"), true);
  assert.equal(matchesProjectFilter(project, "fmcg"), false);
});

test("matches a project when any assigned service is selected", () => {
  assert.equal(matchesProjectFilter(project, "2D Animation"), true);
  assert.equal(matchesProjectFilter(project, "Online"), true);
});

test("does not match an unassigned service or unrelated Type", () => {
  assert.equal(matchesProjectFilter(project, "AIGC"), false);
  assert.equal(matchesProjectFilter(project, "Automotive"), false);
});

test("does not use project search text for a category filter", () => {
  const searchableProject = {
    type: "FMCG",
    services: ["Online"],
    search: "AIGC campaign",
  };

  assert.equal(matchesProjectFilter(searchableProject, "AIGC"), false);
});

test("matches search text without regard to case", () => {
  assert.equal(matchesProjectFilter(project, { search: "VOLVO" }), true);
  assert.equal(matchesProjectFilter(project, { search: "unknown" }), false);
});
