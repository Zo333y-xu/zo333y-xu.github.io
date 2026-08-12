function matchesProjectFilter({ type, services, search }, filter) {
  return type === filter
    || services.includes(filter)
    || search.toLowerCase().includes(filter.toLowerCase());
}

module.exports = { matchesProjectFilter };
