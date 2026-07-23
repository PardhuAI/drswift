(() => {
  const toolbar = document.querySelector(".tests-toolbar");
  if (!toolbar) {
    return;
  }

  // category = exact CMS testCategories checkbox value (attributesJson.testCategories).
  const healthCategories = [
    { label: "Heart Health Tests", category: "Heart" },
    { label: "Diabetes Risk Tests", category: "Diabetes" },
    { label: "Thyroid Profile", category: "Thyroid" },
    { label: "Women's Health", category: "Women" },
    { label: "Full Body Checkup", category: "Full Body Checkup" },
    { label: "Vitamin D", category: "Vitamin D" },
    { label: "Kidney Health", category: "Kidney" },
    { label: "CBC", category: "CBC" },
    { label: "Fever", category: "Fever" },
    { label: "Vitamins", category: "Vitamins" },
    { label: "Cholesterol", category: "Cholesterol" },
  ];

  const audienceLinks = {
    him: [
      { label: "Heart Health Tests", category: "Heart" },
      { label: "Diabetes Risk Tests", category: "Diabetes" },
      { label: "Full Body Checkup", category: "Full Body Checkup" },
      { label: "Kidney Health", category: "Kidney" },
      { label: "Sexual Health", category: "Sexual Health" },
      { label: "Testosterone", category: "Testosterone" },
      { label: "Cholesterol", category: "Cholesterol" },
      { label: "Liver Health", category: "Liver" },
    ],
    her: [
      { label: "Women's Health", category: "Women" },
      { label: "Thyroid Profile", category: "Thyroid" },
      { label: "Full Body Checkup", category: "Full Body Checkup" },
      { label: "Vitamin D", category: "Vitamin D" },
      { label: "Heart Health Tests", category: "Heart" },
      { label: "Pregnancy Care", category: "Pregnancy" },
      { label: "Hairfall", category: "HairFall" },
      { label: "Weight Management", category: "Weight" },
    ],
    loved: [
      { label: "Full Body Checkup", category: "Full Body Checkup" },
      { label: "Heart Health Tests", category: "Heart" },
      { label: "Diabetes Risk Tests", category: "Diabetes" },
      { label: "Thyroid Profile", category: "Thyroid" },
      { label: "Vitamin D", category: "Vitamin D" },
    ],
  };

  const audienceFilter = {
    him: "Men",
    her: "Women",
    loved: "50+",
  };

  const mainTabs = [...document.querySelectorAll(".tests-audience-tabs .tests-tab")];
  const panelTabs = [...document.querySelectorAll(".tests-quick-filters .tests-tab")];
  const allTestsButton = document.querySelector('[data-row1="all"]');
  const searchInput = document.getElementById("catalog-search-input");
  const searchToggle = document.querySelector(".tests-search-toggle");
  const searchPanel = document.getElementById("tests-search-panel");
  const clearSearch = document.querySelector("[data-clear-search]");
  const healthCategoriesContainer = document.querySelector("[data-health-categories]");
  const extraFiltersContainer = document.querySelector("[data-extra-filters]");
  const extraFiltersScroll = document.getElementById("tests-extra-filters-scroll");
  const extraFiltersScrollButtons = [...document.querySelectorAll(".tests-extra-filters__scroll")];
  const quickTestsContainer = document.querySelector("[data-quick-tests]");
  const audienceCategoriesWrap = document.querySelector("[data-filters-row='2']");
  const audienceQuickLinks = document.querySelector("[data-audience-quick-links]");
  const audienceCategoriesScrollButtons = [
    ...document.querySelectorAll(".tests-audience-categories__scroll"),
  ];
  const quickFiltersRoot = document.querySelector(".tests-quick-filters");
  const quickFiltersToggle = document.querySelector(".tests-quick-filters__toggle");
  const quickFiltersPanel = document.getElementById("tests-quick-filters-panel");
  const quickFiltersBackdrop = document.querySelector("[data-quick-filters-backdrop]");
  const mobileMediaQuery = window.matchMedia("(max-width: 879px)");

  let row1Selection = "all";
  let activeGroup = "her";
  let activeQuickKey = "";
  let healthFilterButtons = [];

  function setCatalogFilterSafe(filter) {
    if (typeof window.setCatalogFilter === "function") {
      window.setCatalogFilter(filter);
      return;
    }
  }

  function applyCatalogFilterSafe() {
    if (typeof window.applyCatalogFilter === "function") {
      window.applyCatalogFilter(window.activeCatalogFilter || "all");
    }
  }

  function isAudienceSelection(value = row1Selection) {
    return value === "him" || value === "her" || value === "loved";
  }

  function findHealth(label) {
    return healthCategories.find((item) => item.label === label);
  }

  function syncSearchClear() {
    if (!clearSearch || !searchInput) {
      return;
    }
    clearSearch.hidden = !searchInput.value.trim();
  }

  function setSearchQuery(value) {
    if (!searchInput) {
      return;
    }
    searchInput.value = value || "";
    syncSearchClear();
    applyCatalogFilterSafe();
  }

  function applySelection() {
    if (row1Selection === "all") {
      setSearchQuery("");
      setCatalogFilterSafe("all");
      return;
    }

    if (isAudienceSelection()) {
      setSearchQuery("");
      setCatalogFilterSafe(audienceFilter[row1Selection] || "all");
      return;
    }

    const health = findHealth(row1Selection);
    if (!health) {
      setSearchQuery("");
      setCatalogFilterSafe("all");
      return;
    }

    setSearchQuery("");
    setCatalogFilterSafe(health.category);
  }

  function syncRow1State() {
    allTestsButton?.classList.toggle("is-active", row1Selection === "all");
    allTestsButton?.setAttribute("aria-pressed", String(row1Selection === "all"));

    [...mainTabs, ...panelTabs].forEach((tab) => {
      const isActive = row1Selection === tab.dataset.group;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    healthFilterButtons.forEach((button) => {
      const isActive = row1Selection === button.dataset.filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    document.querySelectorAll("[data-health-categories] .tests-filter-chip").forEach((button) => {
      const isActive = row1Selection === button.dataset.filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    toolbar.dataset.group = isAudienceSelection() ? row1Selection : activeGroup;
    if (quickFiltersRoot) {
      quickFiltersRoot.dataset.group = isAudienceSelection() ? row1Selection : activeGroup;
    }
  }

  function syncQuickLinkState() {
    document
      .querySelectorAll("[data-audience-quick-links] [data-quick-key], .tests-quick-filters [data-quick-key]")
      .forEach((button) => {
        const isActive = button.dataset.quickKey === activeQuickKey;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
  }

  function syncAudienceQuickLinksVisibility() {
    if (!audienceCategoriesWrap) {
      return;
    }
    audienceCategoriesWrap.classList.toggle("is-collapsed", !isAudienceSelection());
    updateAudienceCategoriesScrollButtons();
  }

  function updateExtraFiltersScrollButtons() {
    if (!extraFiltersScroll || !extraFiltersScrollButtons.length) {
      return;
    }
    const atStart = extraFiltersScroll.scrollLeft <= 1;
    const atEnd =
      extraFiltersScroll.scrollLeft + extraFiltersScroll.clientWidth >=
      extraFiltersScroll.scrollWidth - 1;
    const canScroll = extraFiltersScroll.scrollWidth > extraFiltersScroll.clientWidth + 1;
    extraFiltersScrollButtons.forEach((button) => {
      const direction = Number(button.dataset.extraFiltersScrollDir);
      button.disabled = !canScroll || (direction < 0 ? atStart : atEnd);
    });
  }

  function updateAudienceCategoriesScrollButtons() {
    if (!audienceQuickLinks || !audienceCategoriesScrollButtons.length) {
      return;
    }
    const atStart = audienceQuickLinks.scrollLeft <= 1;
    const atEnd =
      audienceQuickLinks.scrollLeft + audienceQuickLinks.clientWidth >=
      audienceQuickLinks.scrollWidth - 1;
    const canScroll = audienceQuickLinks.scrollWidth > audienceQuickLinks.clientWidth + 1;
    audienceCategoriesScrollButtons.forEach((button) => {
      const direction = Number(button.dataset.audienceCategoriesScrollDir);
      button.disabled = !canScroll || (direction < 0 ? atStart : atEnd);
    });
  }

  function enableDragScroll(container, onScroll) {
    if (!container) {
      return;
    }
    container.classList.add("is-drag-scroll");
    let isPointerDown = false;
    let isDragging = false;
    let suppressClick = false;
    let startX = 0;
    let startScrollLeft = 0;
    let activePointerId = null;
    const DRAG_THRESHOLD = 6;

    container.addEventListener("pointerdown", (event) => {
      // Touch/pen can use native overflow scrolling.
      if (event.pointerType !== "mouse" || event.button !== 0) {
        return;
      }
      isPointerDown = true;
      isDragging = false;
      suppressClick = false;
      activePointerId = event.pointerId;
      startX = event.clientX;
      startScrollLeft = container.scrollLeft;
    });

    container.addEventListener("pointermove", (event) => {
      if (!isPointerDown || event.pointerId !== activePointerId) {
        return;
      }
      const delta = event.clientX - startX;
      if (!isDragging) {
        if (Math.abs(delta) < DRAG_THRESHOLD) {
          return;
        }
        isDragging = true;
        suppressClick = true;
        container.classList.add("is-dragging");
        container.setPointerCapture?.(event.pointerId);
      }
      event.preventDefault();
      container.scrollLeft = startScrollLeft - delta;
      onScroll?.();
    });

    const endDrag = (event) => {
      if (!isPointerDown || (activePointerId != null && event.pointerId !== activePointerId)) {
        return;
      }
      isPointerDown = false;
      activePointerId = null;
      if (isDragging) {
        container.classList.remove("is-dragging");
        try {
          container.releasePointerCapture?.(event.pointerId);
        } catch (_) {
          /* already released */
        }
      }
      isDragging = false;
    };

    container.addEventListener("pointerup", endDrag);
    container.addEventListener("pointercancel", endDrag);
    container.addEventListener(
      "click",
      (event) => {
        if (!suppressClick) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
      },
      true,
    );
    container.addEventListener("scroll", () => onScroll?.(), { passive: true });
  }

  function closeQuickFilters() {
    if (!quickFiltersToggle || !quickFiltersPanel) {
      return;
    }
    quickFiltersPanel.hidden = true;
    quickFiltersPanel.classList.remove("is-mobile-sheet");
    if (quickFiltersBackdrop) {
      quickFiltersBackdrop.hidden = true;
      quickFiltersBackdrop.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("is-quick-filters-open");
    quickFiltersToggle.setAttribute("aria-expanded", "false");
  }

  function openQuickFilters() {
    if (!quickFiltersToggle || !quickFiltersPanel) {
      return;
    }
    const useMobileSheet = mobileMediaQuery.matches;
    quickFiltersPanel.classList.toggle("is-mobile-sheet", useMobileSheet);
    quickFiltersPanel.hidden = false;
    if (quickFiltersBackdrop) {
      quickFiltersBackdrop.hidden = !useMobileSheet;
      quickFiltersBackdrop.setAttribute("aria-hidden", String(!useMobileSheet));
    }
    document.body.classList.toggle("is-quick-filters-open", useMobileSheet);
    quickFiltersToggle.setAttribute("aria-expanded", "true");
  }

  function syncQuickFiltersToggleMark() {
    if (!quickFiltersToggle) {
      return;
    }
    const hasSelection =
      row1Selection !== "all" || Boolean(activeQuickKey) || Boolean(searchInput?.value.trim());
    quickFiltersToggle.classList.toggle("has-selection", hasSelection);
  }

  function buildBarHealthFilterButton(item) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tests-filter-link";
    button.textContent = item.label;
    button.dataset.filter = item.label;
    button.setAttribute("aria-pressed", "false");
    return button;
  }

  function buildPanelHealthChip(item) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tests-filter-chip";
    button.textContent = item.label;
    button.dataset.filter = item.label;
    button.setAttribute("aria-pressed", "false");
    return button;
  }

  function buildQuickLinkButton(item, className) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = item.label;
    button.dataset.quickKey = item.category;
    button.dataset.filter = item.category;
    button.setAttribute("aria-pressed", "false");
    return button;
  }

  function renderHealthFilters() {
    if (extraFiltersContainer) {
      healthFilterButtons = healthCategories.map((item) => buildBarHealthFilterButton(item));
      extraFiltersContainer.replaceChildren(...healthFilterButtons);
      healthFilterButtons.forEach((button) => {
        button.addEventListener("click", () => selectHealth(button.dataset.filter));
      });
    }

    if (healthCategoriesContainer) {
      const chips = healthCategories.map((item) => buildPanelHealthChip(item));
      healthCategoriesContainer.replaceChildren(...chips);
      chips.forEach((button) => {
        button.addEventListener("click", () => {
          selectHealth(button.dataset.filter);
          closeQuickFilters();
        });
      });
    }
  }

  function renderAudienceLinks(groupKey) {
    const links = audienceLinks[groupKey] || [];
    if (audienceQuickLinks) {
      const buttons = links.map((item) => buildQuickLinkButton(item, "tests-quick-link"));
      audienceQuickLinks.replaceChildren(...buttons);
      buttons.forEach((button) => {
        button.addEventListener("click", () => selectQuickLink(button));
      });
    }

    if (quickTestsContainer) {
      const buttons = links.map((item) =>
        buildQuickLinkButton(item, "tests-quick-link tests-quick-link--panel"),
      );
      quickTestsContainer.replaceChildren(...buttons);
      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          selectQuickLink(button);
          closeQuickFilters();
        });
      });
    }

    syncQuickLinkState();
    updateAudienceCategoriesScrollButtons();
  }

  function selectAll() {
    row1Selection = "all";
    activeQuickKey = "";
    syncRow1State();
    syncAudienceQuickLinksVisibility();
    syncQuickLinkState();
    syncQuickFiltersToggleMark();
    applySelection();
    audienceQuickLinks?.scrollTo({ left: 0 });
  }

  function selectAudience(groupKey) {
    activeGroup = groupKey;
    row1Selection = groupKey;
    activeQuickKey = "";
    renderAudienceLinks(groupKey);
    syncRow1State();
    syncAudienceQuickLinksVisibility();
    syncQuickFiltersToggleMark();
    applySelection();
    audienceQuickLinks?.scrollTo({ left: 0 });
  }

  function selectHealth(label) {
    row1Selection = label;
    activeQuickKey = "";
    syncRow1State();
    syncAudienceQuickLinksVisibility();
    syncQuickLinkState();
    syncQuickFiltersToggleMark();
    applySelection();
  }

  function selectQuickLink(button) {
    const category = button.dataset.filter || "all";
    activeQuickKey = button.dataset.quickKey || "";
    syncQuickLinkState();
    syncQuickFiltersToggleMark();
    setSearchQuery("");
    setCatalogFilterSafe(category);
  }

  function selectCategoryFilter(category) {
    const exact = healthCategories.find(
      (item) => item.category.toLowerCase() === category.toLowerCase()
    );
    if (exact) {
      selectHealth(exact.label);
      return true;
    }
    const byLabel = healthCategories.find(
      (item) => item.label.toLowerCase() === category.toLowerCase()
    );
    if (byLabel) {
      selectHealth(byLabel.label);
      return true;
    }
    activeQuickKey = "";
    syncQuickLinkState();
    syncQuickFiltersToggleMark();
    setSearchQuery("");
    setCatalogFilterSafe(category);
    return true;
  }

  function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const group = String(params.get("group") || "").toLowerCase();
    const category = String(params.get("category") || "").trim();
    const q = String(params.get("q") || "").trim();
    let applied = false;

    if (group === "him" || group === "her" || group === "loved") {
      selectAudience(group);
      applied = true;
    }

    if (category) {
      const normalized = category.toLowerCase();
      if (normalized === "men" || normalized === "men's health") {
        selectAudience("him");
        applied = true;
      } else if (normalized === "women" || normalized === "women's health") {
        selectAudience("her");
        applied = true;
      } else if (normalized === "50+" || normalized === "loved" || normalized === "senior") {
        selectAudience("loved");
        applied = true;
      } else {
        const health = healthCategories.find(
          (item) =>
            item.category.toLowerCase() === normalized ||
            item.label.toLowerCase() === normalized
        );
        if (health) {
          selectHealth(health.label);
        } else if (applied && isAudienceSelection()) {
          activeQuickKey = "";
          syncQuickLinkState();
          setSearchQuery("");
          setCatalogFilterSafe(category);
        } else {
          selectCategoryFilter(category);
        }
        applied = true;
      }
    }

    if (q) {
      setSearchQuery(q);
      applied = true;
    }

    return applied;
  }

  allTestsButton?.addEventListener("click", () => selectAll());

  [...mainTabs, ...panelTabs].forEach((tab) => {
    tab.addEventListener("click", () => selectAudience(tab.dataset.group || "her"));
  });

  // Delegated clicks so filter taps always win over drag-scroll.
  extraFiltersScroll?.addEventListener("click", (event) => {
    const allBtn = event.target.closest('[data-row1="all"]');
    if (allBtn) {
      event.preventDefault();
      selectAll();
      return;
    }

    const tab = event.target.closest(".tests-audience-tabs .tests-tab");
    if (tab) {
      event.preventDefault();
      selectAudience(tab.dataset.group || "her");
      return;
    }

    const healthBtn = event.target.closest(".tests-health-filters .tests-filter-link");
    if (healthBtn?.dataset.filter) {
      event.preventDefault();
      selectHealth(healthBtn.dataset.filter);
    }
  });

  audienceQuickLinks?.addEventListener("click", (event) => {
    const link = event.target.closest("[data-quick-key]");
    if (!link) {
      return;
    }
    event.preventDefault();
    selectQuickLink(link);
  });

  extraFiltersScrollButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = Number(button.dataset.extraFiltersScrollDir) || 1;
      const link = extraFiltersScroll?.querySelector(".tests-filter-link");
      const step = (link?.getBoundingClientRect().width || 120) + 12;
      extraFiltersScroll?.scrollBy({ left: direction * step, behavior: "smooth" });
    });
  });

  audienceCategoriesScrollButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = Number(button.dataset.audienceCategoriesScrollDir) || 1;
      const link = audienceQuickLinks?.querySelector(".tests-quick-link");
      const step = (link?.getBoundingClientRect().width || 140) + 12;
      audienceQuickLinks?.scrollBy({ left: direction * step, behavior: "smooth" });
    });
  });

  enableDragScroll(extraFiltersScroll, updateExtraFiltersScrollButtons);
  enableDragScroll(audienceQuickLinks, updateAudienceCategoriesScrollButtons);

  searchToggle?.addEventListener("click", () => {
    searchInput?.focus();
  });

  clearSearch?.addEventListener("click", () => {
    setSearchQuery("");
    searchInput?.focus();
    syncQuickFiltersToggleMark();
  });

  searchInput?.addEventListener("input", () => {
    syncSearchClear();
    syncQuickFiltersToggleMark();
  });

  quickFiltersToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = quickFiltersToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeQuickFilters();
    } else {
      openQuickFilters();
    }
  });

  quickFiltersBackdrop?.addEventListener("click", () => closeQuickFilters());

  document.addEventListener("click", (event) => {
    if (!quickFiltersRoot?.contains(event.target)) {
      closeQuickFilters();
    }
  });

  window.addEventListener("resize", () => {
    updateExtraFiltersScrollButtons();
    updateAudienceCategoriesScrollButtons();
    if (!mobileMediaQuery.matches) {
      closeQuickFilters();
    }
  });

  renderHealthFilters();
  renderAudienceLinks(activeGroup);
  if (!applyUrlParams()) {
    selectAll();
  }
  updateExtraFiltersScrollButtons();
  updateAudienceCategoriesScrollButtons();

  function startHeadingRotation() {
    const heading = document.getElementById("tests-page-heading");
    const viewport = heading?.querySelector(".tests-page-heading__viewport");
    if (!heading || !viewport || heading.dataset.rotating === "true") {
      return;
    }

    const phrases = [
      "Browse All Tests",
      "Men's Health Tests",
      "Women's Health",
      "Heart Health",
      "Mom and Dad Health",
      "Liver Health",
      "Browse All Tests",
    ];

    heading.dataset.rotating = "true";
    heading.classList.add("is-animating");
    viewport.replaceChildren();

    const nodes = phrases.map((text, index) => {
      const span = document.createElement("span");
      span.className = "tests-page-heading__phrase" + (index === 0 ? " is-active" : "");
      span.textContent = text;
      viewport.appendChild(span);
      return span;
    });

    let index = 0;
    const HOLD_MS = 2200;
    const TRANSITION_MS = 420;

    const tick = () => {
      if (index >= nodes.length - 1) {
        heading.classList.remove("is-animating");
        return;
      }

      const current = nodes[index];
      const nextIndex = index + 1;
      const next = nodes[nextIndex];

      current.classList.remove("is-active");
      current.classList.add("is-exit");
      next.classList.remove("is-exit");
      void next.offsetWidth;
      next.classList.add("is-active");

      window.setTimeout(() => {
        current.classList.remove("is-exit");
      }, TRANSITION_MS);

      index = nextIndex;

      if (index < nodes.length - 1) {
        window.setTimeout(tick, HOLD_MS);
      } else {
        heading.classList.remove("is-animating");
      }
    };

    window.setTimeout(tick, HOLD_MS);
  }

  // Re-apply after catalog cards render asynchronously.
  window.addEventListener("drswift:catalog-ready", () => {
    if (!applyUrlParams()) {
      applySelection();
    }
    startHeadingRotation();
  });

  if (document.querySelector("#catalog-grid .test-card--catalog")) {
    startHeadingRotation();
  }

  window.addEventListener("drswift:catalog-clear-search", () => {
    if (searchInput) {
      searchInput.value = "";
    }
    syncSearchClear();
    syncQuickFiltersToggleMark();
  });

  window.addEventListener("drswift:catalog-show-all", () => {
    selectAll();
  });
})();
