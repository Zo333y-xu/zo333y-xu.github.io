function matchesProjectFilter({ type, services, search }, filter) {
  if (typeof filter === "string") return type === filter || services.includes(filter);
  return search.toLowerCase().includes(filter.search.toLowerCase());
}

module.exports = { matchesProjectFilter };
