const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.addEventListener("click", (event) => {
    if (event.target.closest("a") && navMenu.classList.contains("is-open")) {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const heroStatement = document.querySelector(".hero-statement--spring");
const heroPoints = document.querySelector(".hero-points--reveal");
const heroItem4 = document.querySelector(".hero-points--reveal .item-4");
const quickCards = document.getElementById("quick-cards");

function startHeroAnimations() {
  if (heroStatement) {
    heroStatement.classList.add("is-playing");
  }
  if (heroPoints) {
    heroPoints.classList.add("is-playing");
  }
}

function restartQuickCardAnimations() {
  if (!quickCards) {
    return;
  }

  quickCards.querySelectorAll(".quick-card").forEach((card) => {
    card.style.animation = "none";
    void card.getBoundingClientRect();
    card.style.removeProperty("animation");
  });
}

if (heroStatement || heroPoints) {
  if (prefersReducedMotion) {
    startHeroAnimations();
  } else {
    requestAnimationFrame(startHeroAnimations);
  }
}

if (heroItem4 && quickCards && !prefersReducedMotion) {
  heroItem4.addEventListener(
    "animationend",
    (event) => {
      if (
        event.animationName === "hero-point-reveal" &&
        window.matchMedia("(min-width: 880px)").matches
      ) {
        restartQuickCardAnimations();
      }
    },
    { once: true }
  );
}

// Duration of the carousel arrow scroll in milliseconds. Higher = slower.
const SCROLL_DURATION = 750;

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function animateScrollBy(element, delta, duration) {
  if (prefersReducedMotion || duration <= 0) {
    element.scrollLeft += delta;
    return;
  }

  const start = element.scrollLeft;
  const maxScroll = element.scrollWidth - element.clientWidth;
  const target = Math.max(0, Math.min(start + delta, maxScroll));
  const change = target - start;
  if (change === 0) {
    return;
  }

  const startTime = performance.now();
  const prevScrollBehavior = element.style.scrollBehavior;
  const prevSnapType = element.style.scrollSnapType;
  element.style.scrollBehavior = "auto";
  element.style.scrollSnapType = "none";

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    element.scrollLeft = start + change * easeInOutQuad(progress);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.style.scrollBehavior = prevScrollBehavior;
      element.style.scrollSnapType = prevSnapType;
    }
  }

  requestAnimationFrame(step);
}

// Populate the results-table SVG headers with dates relative to today (DD/MM/YY).
function formatShortDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

[
  { id: "report-ordered", offsetDays: 1 },
  { id: "report-collected", offsetDays: 0 },
  { id: "report-generated", offsetDays: 0 },
  { id: "report-date-today", offsetDays: 0 },
  { id: "report-date-45", offsetDays: 45 },
  { id: "report-date-90", offsetDays: 90 },
].forEach(({ id, offsetDays }) => {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }
  const date = new Date();
  date.setDate(date.getDate() - offsetDays);
  el.textContent = formatShortDate(date);
});

document.querySelectorAll("[data-scroll-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-scroll-target");
    const direction = Number(button.getAttribute("data-scroll-dir")) || 1;
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    const firstCard = target.querySelector(":scope > *");
    const distance = firstCard ? firstCard.getBoundingClientRect().width + 18 : 320;

    animateScrollBy(target, direction * distance, SCROLL_DURATION);
  });
});

// Hover-to-pan: desktop only (touch/mousemove on mobile caused runaway scrolling).
const panSection = document.querySelector(".quick-select");
const panTarget = document.getElementById("quick-cards");
const desktopCarousel = window.matchMedia("(min-width: 880px)");

// Shared so hover-pan pauses while the user is manually dragging the cards.
let isDraggingCards = false;

if (panSection && panTarget && !prefersReducedMotion && desktopCarousel.matches) {
  const MAX_PAN_SPEED = 2; // px per frame at the far edges (slow, readable)
  const DEAD_ZONE = 0.08; // fraction around center with no movement
  let pointerX = null;
  let rafId = null;
  let savedSnap = "";
  let savedBehavior = "";

  function enterPanMode() {
    savedSnap = panTarget.style.scrollSnapType;
    savedBehavior = panTarget.style.scrollBehavior;
    panTarget.style.scrollSnapType = "none";
    panTarget.style.scrollBehavior = "auto";
  }

  function exitPanMode() {
    panTarget.style.scrollSnapType = savedSnap;
    panTarget.style.scrollBehavior = savedBehavior;
  }

  function panTick() {
    if (pointerX === null) {
      rafId = null;
      exitPanMode();
      return;
    }

    // Hold auto-pan while the user is dragging the cards manually.
    if (isDraggingCards) {
      rafId = requestAnimationFrame(panTick);
      return;
    }

    const rect = panSection.getBoundingClientRect();
    const ratio = ((pointerX - rect.left) / rect.width) * 2 - 1; // -1 (left) .. 1 (right)
    const magnitude = Math.abs(ratio);

    if (magnitude > DEAD_ZONE) {
      const normalized = (magnitude - DEAD_ZONE) / (1 - DEAD_ZONE);
      panTarget.scrollLeft += Math.sign(ratio) * normalized * MAX_PAN_SPEED;
    }

    rafId = requestAnimationFrame(panTick);
  }

  panSection.addEventListener("mousemove", (event) => {
    pointerX = event.clientX;
    if (rafId === null) {
      enterPanMode();
      rafId = requestAnimationFrame(panTick);
    }
  });

  panSection.addEventListener("mouseleave", () => {
    pointerX = null;
  });
}

// Mobile: gently nudge one card to the right once, then stop (scrollability hint).
const mobileCarousel = window.matchMedia("(max-width: 879px)");
const MOBILE_NUDGE_DELAY_MS = 900;
const MOBILE_NUDGE_DURATION_MS = 1100;

function getQuickCardStep() {
  const firstCard = panTarget?.querySelector(".quick-card");
  return firstCard ? firstCard.getBoundingClientRect().width + 16 : 176;
}

function nudgeMobileCarouselOnce() {
  if (
    prefersReducedMotion ||
    !mobileCarousel.matches ||
    !panTarget ||
    panTarget.dataset.nudged === "true" ||
    panTarget.scrollWidth <= panTarget.clientWidth + 8
  ) {
    return;
  }

  panTarget.dataset.nudged = "true";
  const nudgeTimer = window.setTimeout(() => {
    if (panTarget.scrollLeft > 4) {
      return;
    }
    animateScrollBy(panTarget, getQuickCardStep(), MOBILE_NUDGE_DURATION_MS);
  }, MOBILE_NUDGE_DELAY_MS);

  const cancelNudge = () => {
    window.clearTimeout(nudgeTimer);
  };

  panTarget.addEventListener("scroll", cancelNudge, { once: true, passive: true });
  panTarget.addEventListener("touchstart", cancelNudge, { once: true, passive: true });
}

if (panSection && panTarget && !prefersReducedMotion) {
  const nudgeObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        nudgeMobileCarouselOnce();
        nudgeObserver.disconnect();
      }
    },
    { threshold: 0.35 }
  );

  nudgeObserver.observe(panSection);

  window.addEventListener("load", nudgeMobileCarouselOnce);
  mobileCarousel.addEventListener("change", () => {
    if (mobileCarousel.matches) {
      nudgeMobileCarouselOnce();
    }
  });
}

// Mobile swipe hint: show for 5s when quick-select enters view, once per page load.
const swipeHint = document.querySelector(".quick-select__hint.swipe-hint");
const SWIPE_HINT_DURATION_MS = 5000;

function showSwipeHintOnce() {
  if (
    !swipeHint ||
    swipeHint.dataset.shown === "true" ||
    !mobileCarousel.matches
  ) {
    return;
  }

  swipeHint.dataset.shown = "true";
  swipeHint.classList.add("is-active");
  swipeHint.setAttribute("aria-hidden", "false");

  window.setTimeout(() => {
    swipeHint.classList.remove("is-active");
    swipeHint.setAttribute("aria-hidden", "true");
  }, SWIPE_HINT_DURATION_MS);
}

if (panSection && swipeHint) {
  const swipeHintObserver = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        showSwipeHintOnce();
        swipeHintObserver.disconnect();
      }
    },
    { threshold: 0.35 }
  );

  swipeHintObserver.observe(panSection);
}

// Audience heading: gentle left-right wobble while the section is in view.
const audienceSection = document.querySelector(".audience-tests");
const audienceHeading = document.querySelector(".audience-tests .section-heading");

if (audienceSection && audienceHeading && !prefersReducedMotion) {
  const audienceHeadingObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        audienceHeading.classList.toggle("is-playing", entry.isIntersecting);
      });
    },
    { threshold: 0.12 }
  );

  audienceHeadingObserver.observe(audienceSection);
}

// Click-hold-drag: press on the cards and drag left/right to scroll manually.
if (panTarget) {
  const DRAG_THRESHOLD = 6; // px before a press counts as a drag (vs. a click)
  let startX = 0;
  let startScrollLeft = 0;
  let movedDuringDrag = false;
  let savedSnapDrag = "";
  let savedBehaviorDrag = "";

  panTarget.style.cursor = "grab";

  panTarget.addEventListener("mousedown", (event) => {
    if (event.button !== 0) {
      return;
    }
    isDraggingCards = true;
    movedDuringDrag = false;
    startX = event.clientX;
    startScrollLeft = panTarget.scrollLeft;
    savedSnapDrag = panTarget.style.scrollSnapType;
    savedBehaviorDrag = panTarget.style.scrollBehavior;
    panTarget.style.scrollSnapType = "none";
    panTarget.style.scrollBehavior = "auto";
    panTarget.style.cursor = "grabbing";
    event.preventDefault(); // prevent image/text selection while dragging
  });

  window.addEventListener("mousemove", (event) => {
    if (!isDraggingCards) {
      return;
    }
    const delta = event.clientX - startX;
    if (Math.abs(delta) > DRAG_THRESHOLD) {
      movedDuringDrag = true;
    }
    panTarget.scrollLeft = startScrollLeft - delta;
  });

  window.addEventListener("mouseup", () => {
    if (!isDraggingCards) {
      return;
    }
    isDraggingCards = false;
    panTarget.style.scrollSnapType = savedSnapDrag;
    panTarget.style.scrollBehavior = savedBehaviorDrag;
    panTarget.style.cursor = "grab";
  });

  // If the press turned into a drag, swallow the click so cards don't navigate.
  panTarget.addEventListener(
    "click",
    (event) => {
      if (movedDuringDrag) {
        event.preventDefault();
        event.stopPropagation();
        movedDuringDrag = false;
      }
    },
    true
  );
}

// Replay feature animations every 10s (graph line + metric badge icons).
const graphObject = document.querySelector(".graph-card__img");
const FEATURE_REPLAY_INTERVAL = 10000;
let featureReplayTimer = null;

function restartGraphLineAnimation() {
  const doc = graphObject?.contentDocument;
  if (!doc) {
    return;
  }

  doc.querySelectorAll(".trend-line-shadow, .trend-line-main").forEach((path) => {
    path.style.animation = "none";
    void path.getBoundingClientRect();
    path.style.removeProperty("animation");
  });
}

function restartMetricIconAnimations() {
  document.querySelectorAll(".metric-icon line, .metric-icon polyline").forEach((stroke) => {
    stroke.style.animation = "none";
    void stroke.getBoundingClientRect();
    stroke.style.removeProperty("animation");
  });

  document.querySelectorAll(".metric-icon--up, .metric-icon--down").forEach((icon) => {
    icon.style.animation = "none";
    void icon.getBoundingClientRect();
    icon.style.removeProperty("animation");
  });
}

const METRIC_GLYPHS = {
  droplet:
    '<path d="M12 3s-5 6.2-5 10.2a5 5 0 0 0 10 0C17 9.2 12 3 12 3z" /><path d="M13.6 10.2c1.3 1.9 1.6 3.9 0.9 5.8" />',
  heart: '<path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.4A4 4 0 0 1 19 10c0 5.4-7 10-7 10z" />',
  sun: '<circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />',
  thyroid:
    '<path d="M6 12c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6" /><path d="M12 8v8M9 10.5h6" />',
  glucose:
    '<path d="M4 18h16" /><path d="M7 15l3-4 3 3 4-6" /><circle cx="18" cy="7" r="1.5" />',
  kidney:
    '<path d="M8.5 8.5c-2 2-2 5.5 0 7.5s5.5 2 7.5 0 2-5.5 0-7.5-5.5-2-7.5 0z" /><path d="M12 8v8" />',
};

const BADGE_ICONS = {
  check:
    '<svg class="metric-icon metric-icon--check" viewBox="0 0 24 24"><polyline pathLength="100" points="4 12 9 17 20 6" /></svg>',
  up: '<svg class="metric-icon metric-icon--up" viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>',
  down:
    '<svg class="metric-icon metric-icon--down" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>',
};

const METRIC_POOL = [
  { label: "HbA1c", value: "5.2%", status: "Healthy", tone: "good", glyph: "droplet", badge: "check" },
  {
    label: "Cholesterol",
    value: "252 mg/dL",
    status: "Borderline",
    tone: "alert",
    glyph: "heart",
    badge: "up",
  },
  { label: "Vitamin D", value: "30 ng/mL", status: "Review", tone: "warn", glyph: "sun", badge: "down" },
  { label: "LDL Cholesterol", value: "98 mg/dL", status: "Optimal", tone: "good", glyph: "heart", badge: "check" },
  { label: "TSH", value: "2.1 mIU/L", status: "Normal", tone: "good", glyph: "thyroid", badge: "check" },
  {
    label: "Fasting Glucose",
    value: "92 mg/dL",
    status: "Healthy",
    tone: "good",
    glyph: "glucose",
    badge: "check",
  },
];

const DEFAULT_METRICS = METRIC_POOL.slice(0, 3);

/* Fixed corner cards on the insights image — unique tests, not rotated with the copy row. */
const OVERLAY_METRICS = {
  left: {
    label: "Hemoglobin",
    value: "13.1 g/dL",
    status: "Healthy",
    tone: "good",
    glyph: "droplet",
    badge: "check",
  },
  right: {
    label: "E2",
    value: "62 pg/mL",
    status: "Healthy",
    tone: "good",
    glyph: "thyroid",
    badge: "check",
  },
};

function buildMetricCard(metric) {
  const glyph = METRIC_GLYPHS[metric.glyph] || METRIC_GLYPHS.droplet;
  const badge = BADGE_ICONS[metric.badge] || BADGE_ICONS.check;

  return `
    <span class="metric metric--${metric.tone}">
      <span class="metric-symbol" aria-hidden="true">
        <svg class="metric-glyph" viewBox="0 0 24 24">${glyph}</svg>
      </span>
      <span class="metric-info">
        <strong>${metric.label}</strong>
        <span class="metric-value">${metric.value}</span>
        <small>${metric.status}</small>
      </span>
      <span class="metric-badge" aria-hidden="true">${badge}</span>
    </span>
  `;
}

function pickRandomMetrics(count, excludeLabels = []) {
  const pool = METRIC_POOL.filter((metric) => !excludeLabels.includes(metric.label));
  const source = pool.length >= count ? pool : METRIC_POOL;

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, count);
    const allHealthy = picked.every((metric) => metric.tone === "good");

    if (!allHealthy) {
      return picked;
    }
  }

  const mixed = source.filter((metric) => metric.tone !== "good");
  const healthy = source.filter((metric) => metric.tone === "good").sort(() => Math.random() - 0.5);
  const anchor = mixed[Math.floor(Math.random() * mixed.length)];

  return [anchor, ...healthy].slice(0, count);
}

function renderMetricRow(row, metrics) {
  row.innerHTML = metrics.map((metric) => buildMetricCard(metric)).join("");
  if (row.closest(".metric-row-scroll")) {
    queueMetricScrollSync();
  }
}

function getMetricRows() {
  return [...document.querySelectorAll(".metric-row-scroll [data-metric-rotate]")];
}

function renderOverlayMetrics() {
  const overlay = document.querySelector(".insights-image-overlay");
  if (!overlay) {
    return;
  }

  if (isMobileMetricView()) {
    overlay.querySelectorAll("[data-metric-overlay]").forEach((slot) => {
      slot.innerHTML = "";
    });
    return;
  }

  const left = overlay.querySelector('[data-metric-overlay="left"]');
  const right = overlay.querySelector('[data-metric-overlay="right"]');

  if (left) {
    left.innerHTML = buildMetricCard(OVERLAY_METRICS.left);
  }

  if (right) {
    right.innerHTML = buildMetricCard(OVERLAY_METRICS.right);
  }
}

const METRIC_SCROLL_VISIBLE = 3;
const METRIC_SCROLL_PAD_BLOCK = 24; /* 10px top + 14px bottom */

function syncMetricScrollViewport() {
  const scroll = document.querySelector(".metric-row-scroll");
  const row = scroll?.querySelector("[data-metric-rotate]");
  if (!scroll || !row) {
    return;
  }

  if (!isMobileMetricView()) {
    scroll.style.removeProperty("--metric-scroll-max");
    return;
  }

  const cards = row.querySelectorAll(".metric");
  if (!cards.length) {
    return;
  }

  let cardHeight = 0;
  cards.forEach((card) => {
    cardHeight = Math.max(cardHeight, card.getBoundingClientRect().height);
  });

  const gap = Number.parseFloat(getComputedStyle(row).rowGap || getComputedStyle(row).gap || "16");
  scroll.style.setProperty(
    "--metric-scroll-max",
    `${cardHeight * METRIC_SCROLL_VISIBLE + gap * (METRIC_SCROLL_VISIBLE - 1) + METRIC_SCROLL_PAD_BLOCK}px`
  );
}

function queueMetricScrollSync() {
  requestAnimationFrame(() => {
    syncMetricScrollViewport();
    requestAnimationFrame(syncMetricScrollViewport);
  });
}

let currentMetricLabels = [];

const mobileMetricView = window.matchMedia("(max-width: 879px)");

function isMobileMetricView() {
  return mobileMetricView.matches;
}

function metricsForViewport() {
  return isMobileMetricView() ? METRIC_POOL : DEFAULT_METRICS;
}

function rotateMetrics(animate = true) {
  const rows = getMetricRows();
  if (!rows.length || isMobileMetricView()) {
    return;
  }

  const metrics = pickRandomMetrics(3, animate ? currentMetricLabels : []);

  if (animate && rows[0].childElementCount) {
    rows.forEach((row) => row.classList.add("is-fading"));
    window.setTimeout(() => {
      rows.forEach((row) => row.classList.remove("is-fading"));
      rows.forEach((row) => renderMetricRow(row, metrics));
      currentMetricLabels = metrics.map((metric) => metric.label);
      restartMetricIconAnimations();
    }, 280);
    return;
  }

  rows.forEach((row) => renderMetricRow(row, metrics));
  currentMetricLabels = metrics.map((metric) => metric.label);
}

function initMetricRotation() {
  const rows = getMetricRows();
  if (!rows.length) {
    return;
  }

  const metrics = metricsForViewport();
  rows.forEach((row) => renderMetricRow(row, metrics));
  currentMetricLabels = metrics.map((metric) => metric.label);
  renderOverlayMetrics();
}

initMetricRotation();

mobileMetricView.addEventListener("change", () => {
  initMetricRotation();
  restartMetricIconAnimations();
  queueMetricScrollSync();
});

window.addEventListener("resize", queueMetricScrollSync);

function restartFeatureAnimations() {
  restartGraphLineAnimation();
  rotateMetrics();
  restartMetricIconAnimations();
}

function initFeatureReplay() {
  if (prefersReducedMotion || featureReplayTimer) {
    return;
  }

  featureReplayTimer = setInterval(restartFeatureAnimations, FEATURE_REPLAY_INTERVAL);
}

if (!prefersReducedMotion) {
  if (graphObject) {
    if (graphObject.contentDocument?.querySelector(".trend-line-main")) {
      initFeatureReplay();
    } else {
      graphObject.addEventListener("load", initFeatureReplay, { once: true });
    }
  } else if (document.querySelector(".metric-row")) {
    initFeatureReplay();
  }
}

// Header scroll shadow
const siteHeader = document.getElementById("site-header");

if (siteHeader) {
  const onScroll = () => {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

// FAQ accordion
document.querySelectorAll(".faq-item").forEach((item) => {
  const button = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");

  if (!button || !answer) {
    return;
  }

  button.addEventListener("click", () => {
    const isOpen = item.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
    answer.hidden = !isOpen;
  });
});

// Newsletter form (front-end only until backend is wired)
const newsletterForm = document.getElementById("newsletter-form");
const newsletterSuccess = document.getElementById("newsletter-success");

if (newsletterForm && newsletterSuccess) {
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailInput = newsletterForm.querySelector('input[type="email"]');

    if (!emailInput?.value.trim()) {
      emailInput?.focus();
      return;
    }

    newsletterSuccess.hidden = false;
    newsletterForm.reset();
  });
}

// Tests catalog filters
const catalogGrid = document.getElementById("catalog-grid");
const catalogEmpty = document.getElementById("catalog-empty");
const filterButtons = document.querySelectorAll(".catalog-toolbar .filter-pill");
const categoryChips = document.querySelectorAll(".tests-category-chip");

function applyCatalogFilter(filter) {
  if (!catalogGrid) {
    return;
  }

  const cards = catalogGrid.querySelectorAll(".test-card--catalog");
  let visibleCount = 0;

  cards.forEach((card) => {
    const categories = card.getAttribute("data-category") || "";
    const matches = filter === "all" || categories.split(/\s+/).includes(filter);
    card.classList.toggle("is-hidden", !matches);
    if (matches) {
      visibleCount += 1;
    }
  });

  if (catalogEmpty) {
    catalogEmpty.hidden = visibleCount > 0;
  }

  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.getAttribute("data-filter") === filter);
  });

  categoryChips.forEach((chip) => {
    chip.classList.toggle("is-active", chip.getAttribute("data-filter") === filter);
  });
}

function setCatalogFilter(filter) {
  applyCatalogFilter(filter);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setCatalogFilter(button.getAttribute("data-filter") || "all");
  });
});

categoryChips.forEach((chip) => {
  chip.addEventListener("click", (event) => {
    const filter = chip.getAttribute("data-filter") || "all";
    setCatalogFilter(filter);
    if (filter !== "all") {
      event.preventDefault();
    }
  });
});
