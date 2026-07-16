(() => {
  const revealItems = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -7%", threshold: 0.08 });
    revealItems.forEach((item) => observer.observe(item));
  }

  const tabs = [...document.querySelectorAll("[data-browse-tab]")];
  if (!tabs.length) return;

  const panels = [...document.querySelectorAll("[data-browse-panel]")];
  const cards = [...document.querySelectorAll(".project-card")];
  const search = document.querySelector("#project-search");
  const status = document.querySelector("[data-filter-status]");

  const showAllCards = () => {
    cards.forEach((card) => { card.hidden = false; });
    if (status) status.textContent = "";
  };

  const setStatus = (label) => {
    if (!status) return;
    const visible = cards.filter((card) => !card.hidden).length;
    status.textContent = label ? `${visible} project${visible === 1 ? "" : "s"} for ${label}` : "";
  };

  const activateTab = (name) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.browseTab === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    panels.forEach((panel) => { panel.hidden = panel.dataset.browsePanel !== name; });
    if (name === "all") showAllCards();
    if (name === "search") {
      showAllCards();
      window.setTimeout(() => search?.focus(), 0);
    }
  };

  tabs.forEach((tab) => tab.addEventListener("click", () => activateTab(tab.dataset.browseTab)));

  document.querySelectorAll("[data-project-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.projectFilter;
      cards.forEach((card) => {
        card.hidden = card.dataset.type !== filter && card.dataset.media !== filter;
      });
      setStatus(filter);
    });
  });

  search?.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    cards.forEach((card) => {
      card.hidden = Boolean(query) && !card.dataset.search.toLowerCase().includes(query);
    });
    setStatus(query || "");
  });
})();
