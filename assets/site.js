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

  const projectCards = [...document.querySelectorAll(".project-card")];
  projectCards.forEach((card) => {
    const label = card.querySelector(".project-hover");
    if (!label) return;

    card.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const bounds = card.getBoundingClientRect();
      const halfWidth = label.offsetWidth / 2;
      const halfHeight = label.offsetHeight / 2;
      const minX = halfWidth + 8;
      const minY = halfHeight + 8;
      const maxX = Math.max(minX, bounds.width - halfWidth - 8);
      const maxY = Math.max(minY, bounds.height - halfHeight - 8);
      const x = Math.min(Math.max(event.clientX - bounds.left + 14 + halfWidth, minX), maxX);
      const y = Math.min(Math.max(event.clientY - bounds.top + 14 + halfHeight, minY), maxY);
      card.style.setProperty("--project-hover-x", `${x}px`);
      card.style.setProperty("--project-hover-y", `${y}px`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--project-hover-x");
      card.style.removeProperty("--project-hover-y");
    });
  });

  const tabs = [...document.querySelectorAll("[data-browse-tab]")];
  if (!tabs.length) return;

  const panels = [...document.querySelectorAll("[data-browse-panel]")];
  const cards = projectCards;
  const search = document.querySelector("#project-search");
  const status = document.querySelector("[data-filter-status]");

  const matchesProjectFilter = (card, filter) => {
    const services = card.dataset.services.split("|");
    if (typeof filter === "string") return card.dataset.type === filter || services.includes(filter);
    return card.dataset.search.toLowerCase().includes(filter.search.toLowerCase());
  };

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
        card.hidden = !matchesProjectFilter(card, filter);
      });
      setStatus(filter);
    });
  });

  search?.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    cards.forEach((card) => {
      card.hidden = Boolean(query) && !matchesProjectFilter(card, { search: query });
    });
    setStatus(query || "");
  });
})();
