const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");

function ensureSkipLink() {
  const main = document.querySelector("main");
  if (!main || document.querySelector(".skip-link")) return;
  if (!main.id) main.id = "main-content";

  const link = document.createElement("a");
  link.className = "skip-link";
  link.href = `#${main.id}`;
  link.textContent = "Skip to main content";
  document.body.prepend(link);
}

ensureSkipLink();

function syncHeaderOffset() {
  const header = document.getElementById("site-header");
  if (!header || document.body.classList.contains("auth-page--split")) {
    document.documentElement.style.setProperty("--header-offset", "0px");
    return;
  }
  const style = getComputedStyle(header);
  if (style.display === "none") {
    document.documentElement.style.setProperty("--header-offset", "0px");
    return;
  }
  const height = Math.ceil(header.getBoundingClientRect().height) || 72;
  document.documentElement.style.setProperty("--header-offset", `${height}px`);
}

syncHeaderOffset();
window.addEventListener("resize", syncHeaderOffset, { passive: true });
window.addEventListener("orientationchange", syncHeaderOffset);
if (document.fonts?.ready) {
  document.fonts.ready.then(syncHeaderOffset).catch(() => {});
}

if (navToggle && navMenu) {
  const setNavOpen = (isOpen) => {
    navMenu.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
    syncHeaderOffset();
  };

  navToggle.addEventListener("click", () => {
    setNavOpen(!navMenu.classList.contains("is-open"));
  });

  navMenu.addEventListener("click", (event) => {
    if (event.target.closest("a") && navMenu.classList.contains("is-open")) {
      setNavOpen(false);
    }
  });

  document.addEventListener("click", (event) => {
    if (!navMenu.classList.contains("is-open")) return;
    if (event.target.closest(".nav-menu, .nav-toggle")) return;
    setNavOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navMenu.classList.contains("is-open")) {
      setNavOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 880px)").matches) {
      setNavOpen(false);
    }
  });
}

/** Keep cart icon visible in the sticky header on mobile (outside the hamburger). */
function ensureMobileHeaderCart() {
  const navbar = document.querySelector(".navbar");
  const toggle = document.querySelector(".nav-toggle");
  const menuCart = document.querySelector(".nav-menu .cart-link");
  if (!navbar || !toggle || !menuCart) return;
  if (navbar.querySelector(".cart-link--header")) return;

  let tools = navbar.querySelector(".nav-bar-tools");
  if (!tools) {
    tools = document.createElement("div");
    tools.className = "nav-bar-tools";
    toggle.replaceWith(tools);
    tools.appendChild(toggle);
  }

  const headerCart = menuCart.cloneNode(true);
  headerCart.classList.add("cart-link--header");
  headerCart.removeAttribute("id");
  const label = headerCart.querySelector("span:not(.cart-count)");
  if (label) {
    label.classList.add("sr-only");
  }
  tools.insertBefore(headerCart, toggle);
}

ensureMobileHeaderCart();


const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const heroStatement = document.querySelector(".hero-statement--spring");
const heroPoints = document.querySelector(".hero-points--reveal");

function startHeroAnimations() {
  if (heroStatement) {
    heroStatement.classList.add("is-playing");
  }
  if (heroPoints) {
    heroPoints.classList.add("is-playing");
  }
}

if (heroStatement || heroPoints) {
  if (prefersReducedMotion) {
    startHeroAnimations();
  } else {
    requestAnimationFrame(startHeroAnimations);
  }
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

function metricLabelKey(metrics) {
  return metrics
    .map((metric) => metric.label)
    .sort()
    .join("|");
}

function pickRandomMetrics(count, excludeLabels = []) {
  const excludeKey = [...excludeLabels].sort().join("|");
  // Prefer unused cards first, then the full pool. Excluding the default trio
  // removes both non-healthy cards; without a full-pool fallback the old code
  // built an undefined card and crashed the rotation timer.
  const sources = [];
  const unused = METRIC_POOL.filter((metric) => !excludeLabels.includes(metric.label));
  if (unused.length >= count) {
    sources.push(unused);
  }
  sources.push(METRIC_POOL);

  for (const source of sources) {
    for (let attempt = 0; attempt < 24; attempt += 1) {
      const shuffled = [...source].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, count);
      const allHealthy = picked.every((metric) => metric.tone === "good");
      const sameAsCurrent = metricLabelKey(picked) === excludeKey;

      if (!allHealthy && !sameAsCurrent) {
        return picked;
      }
    }

    const mixed = source.filter((metric) => metric.tone !== "good");
    if (!mixed.length) {
      continue;
    }

    const healthy = source
      .filter((metric) => metric.tone === "good")
      .sort(() => Math.random() - 0.5);
    const anchor = mixed[Math.floor(Math.random() * mixed.length)];
    const picked = [anchor, ...healthy].slice(0, count);
    if (metricLabelKey(picked) !== excludeKey) {
      return picked;
    }
  }

  return [...METRIC_POOL].sort(() => Math.random() - 0.5).slice(0, count);
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

// Metric rotation starts immediately. Graph line redraw needs an <object> embed
// (not <img>) so we can reach contentDocument and re-trigger the SVG draw animation.
if (!prefersReducedMotion && document.querySelector(".metric-row")) {
  initFeatureReplay();
  // First swap sooner than the 10s replay cadence so desktop rotation is obvious.
  window.setTimeout(() => rotateMetrics(), 2800);
} else if (!prefersReducedMotion && graphObject) {
  if (graphObject.contentDocument?.querySelector(".trend-line-main")) {
    initFeatureReplay();
  } else {
    graphObject.addEventListener("load", initFeatureReplay, { once: true });
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
  const emailInput = newsletterForm.querySelector('input[type="email"]');
  const setNewsletterError = (message) => {
    if (!emailInput) return;
    let error = document.getElementById("newsletter-email-error");
    if (!error) {
      error = document.createElement("p");
      error.className = "form-error";
      error.id = "newsletter-email-error";
      emailInput.closest(".newsletter-form-row")?.after(error);
    }
    error.textContent = message;
    emailInput.setAttribute("aria-invalid", "true");
    emailInput.setAttribute("aria-describedby", "newsletter-email-error");
  };

  const clearNewsletterError = () => {
    if (!emailInput) return;
    emailInput.removeAttribute("aria-invalid");
    emailInput.removeAttribute("aria-describedby");
    document.getElementById("newsletter-email-error")?.remove();
  };

  emailInput?.addEventListener("input", clearNewsletterError);

  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!emailInput?.value.trim()) {
      setNewsletterError("Enter your email address.");
      emailInput?.focus();
      return;
    }

    if (!emailInput.checkValidity()) {
      setNewsletterError("Enter a valid email address.");
      emailInput?.focus();
      return;
    }

    clearNewsletterError();
    newsletterSuccess.hidden = false;
    newsletterForm.reset();
  });
}

// Keep a service area available for the booking flow without claiming coverage before it is confirmed.
const serviceabilityForm = document.querySelector("[data-serviceability-form]");

if (serviceabilityForm) {
  const cityInput = serviceabilityForm.querySelector("[name='city']");
  const pinInput = serviceabilityForm.querySelector("[name='pin']");
  const result = serviceabilityForm.querySelector("[data-serviceability-result]");

  const showServiceabilityResult = (message, isError = false) => {
    if (!result) return;
    result.hidden = false;
    result.textContent = message;
    result.classList.toggle("is-error", isError);
  };

  [cityInput, pinInput].forEach((field) => {
    field?.addEventListener("input", () => {
      field.removeAttribute("aria-invalid");
      result?.classList.remove("is-error");
    });
  });

  serviceabilityForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const city = String(cityInput?.value || "").trim();
    const pin = String(pinInput?.value || "").replace(/\D/g, "");

    if (city.length < 2) {
      cityInput?.setAttribute("aria-invalid", "true");
      cityInput?.focus();
      showServiceabilityResult("Enter your city to check collection coverage.", true);
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      pinInput?.setAttribute("aria-invalid", "true");
      pinInput?.focus();
      showServiceabilityResult("Enter a valid 6-digit PIN code.", true);
      return;
    }

    if (pinInput) pinInput.value = pin;
    try {
      localStorage.setItem("drswift.serviceArea.v1", JSON.stringify({ city, pin }));
    } catch {
      /* Saving the suggestion is optional. */
    }
    const coverage = window.DRSWIFT_SITE_CONTENT?.coverage;
    const hours = coverage?.hours || "collection hours shown at checkout";
    const cities = Array.isArray(coverage?.cities) ? coverage.cities.join(", ") : "service cities";
    showServiceabilityResult(
      `Saved ${city}, ${pin}. Design coverage hours: ${hours}. Cities in design: ${cities}. We’ll reconfirm home-collection availability before payment.`
    );
  });
}

// Tests catalog filters
const catalogGrid = document.getElementById("catalog-grid");
const catalogEmpty = document.getElementById("catalog-empty");
const filterButtons = document.querySelectorAll(".catalog-toolbar .filter-pill");
const catalogSearch = document.querySelector("[data-catalog-search]");
let activeCatalogFilter = "all";

function applyCatalogFilter(filter) {
  if (!catalogGrid) {
    return;
  }

  const cards = catalogGrid.querySelectorAll(".test-card--catalog");
  const query = catalogSearch?.value.trim().toLowerCase() || "";
  let visibleCount = 0;

  cards.forEach((card) => {
    let categories = [];
    try {
      const parsed = JSON.parse(card.getAttribute("data-test-categories") || "[]");
      categories = Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      categories = [];
    }
    const haystack = card.getAttribute("data-search") || card.textContent || "";
    // Exact match against CMS attributesJson.testCategories values.
    const matchesFilter = filter === "all" || categories.includes(filter);
    const matchesSearch = !query || haystack.toLowerCase().includes(query);
    const matches = matchesFilter && matchesSearch;
    card.classList.toggle("is-hidden", !matches);
    if (matches) {
      visibleCount += 1;
    }
  });

  if (catalogEmpty) {
    catalogEmpty.hidden = visibleCount > 0;
  }

  catalogGrid.classList.toggle("is-single-result", visibleCount === 1);
  catalogGrid.classList.toggle("is-sparse", visibleCount === 2);

  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.getAttribute("data-filter") === filter);
  });

}

function setCatalogFilter(filter) {
  activeCatalogFilter = filter;
  applyCatalogFilter(filter);
}

window.setCatalogFilter = setCatalogFilter;
window.applyCatalogFilter = applyCatalogFilter;
Object.defineProperty(window, "activeCatalogFilter", {
  get() {
    return activeCatalogFilter;
  },
  set(value) {
    activeCatalogFilter = value;
  },
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setCatalogFilter(button.getAttribute("data-filter") || "all");
  });
});

document.querySelectorAll("[data-healthy-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.getAttribute("data-healthy-filter") || "all";
    setCatalogFilter(filter);
    const target =
      filter === "all"
        ? document.getElementById("catalog-search")
        : document.getElementById("catalog");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

catalogSearch?.addEventListener("input", () => {
  applyCatalogFilter(activeCatalogFilter);
});

document.querySelector("[data-catalog-clear-search]")?.addEventListener("click", () => {
  if (catalogSearch) {
    catalogSearch.value = "";
  }
  applyCatalogFilter(activeCatalogFilter);
  window.dispatchEvent(new CustomEvent("drswift:catalog-clear-search"));
});

document.querySelector("[data-catalog-show-all]")?.addEventListener("click", () => {
  if (catalogSearch) {
    catalogSearch.value = "";
  }
  setCatalogFilter("all");
  window.dispatchEvent(new CustomEvent("drswift:catalog-show-all"));
});

// Test storefront, detail page, and cart
let TESTS = Array.isArray(window.DRSWIFT_TESTS) ? window.DRSWIFT_TESTS : [];
const CART_STORAGE_KEY = "drswift.cart.v1";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPrice(value) {
  const amount = Number(value || 0);
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function hasDiscountPrice(test, livePrice) {
  const oldPrice = Number(test?.oldPrice);
  const price = livePrice != null ? Number(livePrice) : Number(test?.price || 0);
  return Number.isFinite(oldPrice) && oldPrice > price;
}

/** Details hero eyebrow: CMS `eyebrow`, else `{category} test`. */
function detailEyebrow(test) {
  const fromCms = String(test?.eyebrow || "").trim();
  if (fromCms) {
    return fromCms;
  }
  const category = String(test?.category || "Health").trim() || "Health";
  return /test$/i.test(category) ? category : `${category} test`;
}

function formatOldPriceHtml(test, livePrice, quantity = 1) {
  if (!hasDiscountPrice(test, livePrice)) {
    return "";
  }
  return `<span class="old-price">${formatPrice(Number(test.oldPrice) * quantity)}</span>`;
}

function detailUrl(slug) {
  return `/tests/${encodeURIComponent(slug)}`;
}

function getTestBySlug(slug) {
  return TESTS.find((test) => test.slug === slug);
}

function resolveDetailSlug() {
  const pathMatch = window.location.pathname.match(/^\/tests\/([^/]+)\/?$/);
  if (pathMatch) {
    try {
      return decodeURIComponent(pathMatch[1]);
    } catch {
      return pathMatch[1];
    }
  }
  const ssrSlug = window.__DRSWIFT_SSR__ && window.__DRSWIFT_SSR__.detailSlug;
  if (ssrSlug) {
    return String(ssrSlug);
  }
  const params = new URLSearchParams(window.location.search);
  return params.get("test") || params.get("slug") || "";
}

function readCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) {
      return [];
    }
    // Lab tests are one line each — never keep duplicate quantities.
    return parsed
      .filter((item) => item && item.slug && (!TESTS.length || getTestBySlug(item.slug)))
      .map((item) => ({
        slug: item.slug,
        quantity: 1,
        ...(Array.isArray(item.customPanels) ? { customPanels: item.customPanels } : {}),
        ...(typeof item.recipient === "string" && item.recipient.trim()
          ? { recipient: item.recipient.trim() }
          : {})
      }));
  } catch {
    return [];
  }
}

function writeCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadges();
}

function cartQuantity() {
  return readCart().length;
}

function updateCartBadges() {
  const count = cartQuantity();
  document.querySelectorAll("[data-cart-count]").forEach((badge) => {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  });
}

function readStoredJson(key) {
  try {
    return (
      JSON.parse(localStorage.getItem(key) || "null") ||
      JSON.parse(sessionStorage.getItem(key) || "null")
    );
  } catch {
    return null;
  }
}

function clearStoredAccountSession() {
  [
    "drswift.demoSession.v1",
    "drswift.demoAccount.v1",
    "drswift.checkout.phoneVerified.v1",
  ].forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore local storage */
    }
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* ignore session storage */
    }
  });
  window.DRSWIFT_USER = null;
}

function hasLocalAccountSession() {
  return Boolean(
    window.DRSWIFT_USER ||
      readStoredJson("drswift.demoSession.v1") ||
      readStoredJson("drswift.demoAccount.v1")
  );
}

function currentAccountUser() {
  return (
    window.DRSWIFT_USER ||
    readStoredJson("drswift.demoAccount.v1") ||
    readStoredJson("drswift.demoSession.v1") ||
    {}
  );
}

function accountDisplayName(user) {
  return String(user?.displayName || user?.name || user?.email || "My Account").trim();
}

function initialsForAccount(name) {
  const parts = String(name || "My Account").trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] || "M"}${parts[1]?.[0] || "A"}`.toUpperCase();
}

function setAccountMenuOpen(menu, open) {
  if (!menu) return;
  const button = menu.querySelector("[data-nav-account-toggle]");
  const panel = menu.querySelector("[data-nav-account-panel]");
  menu.classList.toggle("is-open", open);
  if (button) button.setAttribute("aria-expanded", open ? "true" : "false");
  if (panel) panel.hidden = !open;
}

function closeAccountMenus(exceptMenu = null) {
  document.querySelectorAll("[data-nav-account-menu].is-open").forEach((menu) => {
    if (menu !== exceptMenu) setAccountMenuOpen(menu, false);
  });
}

function syncAccountNav() {
  const isSignedIn = hasLocalAccountSession();
  document.querySelectorAll(".nav-actions").forEach((actions) => {
    // Drop leftover Book-a-test CTAs from the header; hero/body keep conversion CTAs.
    actions.querySelectorAll(":scope > .nav-cta").forEach((cta) => {
      const label = (cta.textContent || "").trim().toLowerCase();
      if (label === "book a test") cta.remove();
    });

    Array.from(actions.children).forEach((child) => {
      if (child.matches("[data-account-logout]")) child.remove();
    });

    let accountLink = actions.querySelector(":scope > [data-nav-account]");
    let accountMenu = actions.querySelector(":scope > [data-nav-account-menu]");
    if (isSignedIn) {
      if (accountLink) {
        accountLink.remove();
        accountLink = null;
      }
      if (!accountMenu) {
        accountMenu = document.createElement("div");
        accountMenu.className = "nav-account-menu";
        accountMenu.setAttribute("data-nav-account-menu", "");
        accountMenu.innerHTML = `
          <button class="nav-account-trigger" type="button" aria-haspopup="menu" aria-expanded="false" data-nav-account-toggle>
            <span class="nav-account-avatar" aria-hidden="true"></span>
            <span class="nav-account-label">My Account</span>
            <svg class="ui-icon nav-account-chevron" aria-hidden="true" viewBox="0 0 24 24">
              <path d="m7 10 5 5 5-5"></path>
            </svg>
          </button>
          <div class="nav-account-menu__panel" role="menu" data-nav-account-panel hidden>
            <a href="account.html" role="menuitem">Dashboard</a>
            <a href="reports.html" role="menuitem">Reports</a>
            <a href="signup.html?mode=family" role="menuitem">Family profiles</a>
            <button type="button" role="menuitem" data-account-logout>Logout</button>
          </div>
        `;
        actions.appendChild(accountMenu);
      }
      const userName = accountDisplayName(currentAccountUser());
      const trigger = accountMenu.querySelector("[data-nav-account-toggle]");
      const avatar = accountMenu.querySelector(".nav-account-avatar");
      if (trigger) trigger.setAttribute("aria-label", `Open account menu for ${userName}`);
      if (avatar) avatar.textContent = initialsForAccount(userName);
    } else {
      if (accountMenu) accountMenu.remove();
      if (!accountLink) {
        accountLink = document.createElement("a");
        accountLink.className = "nav-account";
        accountLink.setAttribute("data-nav-account", "");
        actions.appendChild(accountLink);
      }
      accountLink.href = "login.html";
      accountLink.textContent = "Sign in";
      accountLink.setAttribute("aria-label", "Sign in to My Account");
    }
  });
}

async function logoutAccountSession() {
  clearStoredAccountSession();
  try {
    if (window.firebase?.auth) {
      await window.firebase.auth().signOut();
    }
  } catch {
    /* Firebase may be unavailable in local demo mode. */
  }
  syncAccountNav();
  window.dispatchEvent(new CustomEvent("drswift:auth-changed", { detail: { user: null } }));
  window.dispatchEvent(new CustomEvent("drswift:account-signed-out"));
}

function getTestLivePrice(test, customPanels) {
  if (!test) {
    return 0;
  }
  if (test.customizable) {
    const selected = Array.isArray(customPanels) ? customPanels : readCustomSelectionForTest(test);
    return calculateBundlePrice(test, selected);
  }
  return Number(test.price || 0);
}

/** @returns {"added"|"exists"|undefined} */
function addToCart(slug) {
  const test = getTestBySlug(slug);
  if (!test) {
    return;
  }
  const cart = readCart();
  const customPanels = test.customizable ? readCustomSelectionForTest(test) : undefined;
  const existing = cart.find((item) => item.slug === slug);
  if (existing) {
    if (customPanels) {
      existing.customPanels = customPanels;
      writeCart(cart);
    }
    return "exists";
  }
  cart.push({
    slug,
    quantity: 1,
    ...(customPanels ? { customPanels } : {})
  });
  writeCart(cart);
  return "added";
}

function updateCartItem(slug, action) {
  let cart = readCart();
  const item = cart.find((entry) => entry.slug === slug);

  if (action === "clear") {
    writeCart([]);
    renderCartPage();
    return;
  }

  if (!item) {
    return;
  }

  // Quantity +/- removed — diagnostics cart is one of each test.
  if (action === "increase" || action === "decrease") {
    return;
  }

  if (action === "remove") {
    cart = cart.filter((entry) => entry.slug !== slug);
  }

  writeCart(cart);
  renderCartPage();
}

function showCartToast(message) {
  let toast = document.querySelector(".cart-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "cart-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.append(toast);
  }

  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showCartToast.timer);
  showCartToast.timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

function buildCatalogCard(test) {
  const filters = (test.filters || ["all"]).join(" ");
  const testCategories = Array.isArray(test.testCategories) ? test.testCategories.map(String) : [];
  const searchText = [
    test.name,
    test.category,
    test.summary,
    test.headline,
    ...(test.markers || []),
    ...(test.reasons || []).flat(),
  ].join(" ");
  const badge = test.badge
    ? `<span class="test-badge test-badge--popular">${escapeHtml(test.badge)}</span>`
    : "";
  const displayPrice = getTestLivePrice(test);
  return `
    <article class="test-card test-card--catalog" data-category="${escapeHtml(filters)}" data-test-categories="${escapeHtml(JSON.stringify(testCategories))}" data-search="${escapeHtml(searchText)}" data-detail-url="${detailUrl(test.slug)}">
      <a class="test-card__layer test-card__media test-image photo-thumb photo-thumb--${escapeHtml(test.imageTone || "blood")}" href="${detailUrl(test.slug)}" aria-label="View ${escapeHtml(test.name)} details">
        <img src="${escapeHtml(test.image)}" alt="" loading="lazy" decoding="async">
        ${badge}
        <span class="test-badge test-badge--category">${escapeHtml(test.category)}</span>
      </a>
      <h3 class="test-card__layer test-card__title">
        <a href="${detailUrl(test.slug)}">${escapeHtml(test.name)}</a>
      </h3>
      <p class="test-card__layer test-card__summary">${escapeHtml(test.summary)}</p>
      <div class="test-card__layer test-card__price price-row">
        <span class="price">${formatPrice(displayPrice)}</span>
        ${formatOldPriceHtml(test, displayPrice)}
      </div>
      <div class="test-card__layer test-card__actions test-card-actions">
        <button class="button primary test-card__book" type="button" data-add-to-cart="${escapeHtml(test.slug)}">Book This Test</button>
      </div>
    </article>
  `;
}

function renderTestsCatalog() {
  const grid = document.querySelector("[data-catalog-grid]");
  if (!grid || !TESTS.length) {
    return;
  }

  grid.innerHTML = TESTS.map(buildCatalogCard).join("");
  applyCatalogFilter(activeCatalogFilter || "all");
  window.dispatchEvent(new CustomEvent("drswift:catalog-ready"));
}

function buildFact(icon, label, value) {
  return `
    <li>
      <span class="detail-fact__icon" aria-hidden="true">
        <svg class="ui-icon"><use href="assets/images/ui-icons.svg#${icon}"></use></svg>
      </span>
      <span>
        <small>${escapeHtml(label)}</small>
        <strong>${escapeHtml(value)}</strong>
      </span>
    </li>
  `;
}

function normalizeMarker(marker) {
  if (typeof marker === "string") {
    return { name: marker, description: "" };
  }
  return {
    name: marker?.name || "",
    description: marker?.description || ""
  };
}

function getPanelCatalog() {
  return window.DRSWIFT_PANELS || {};
}

function getPanelById(panelId) {
  return getPanelCatalog()[panelId] || null;
}

function getCustomPanelIds(test) {
  if (!test?.customizable) {
    return [];
  }
  return [
    ...new Set([
      ...(Array.isArray(test.basePanelIds) ? test.basePanelIds : []),
      ...(Array.isArray(test.optionalPanelIds) ? test.optionalPanelIds : [])
    ])
  ];
}

function getDefaultCustomSelection(test) {
  if (Array.isArray(test?.basePanelIds) && test.basePanelIds.length) {
    return [...test.basePanelIds];
  }
  return getCustomPanelIds(test);
}

function resolveTestPanelIds(test, selectedPanelIds) {
  if (!test) {
    return [];
  }
  if (test.customizable) {
    const customPanelIds = getCustomPanelIds(test);
    const fallback = getDefaultCustomSelection(test);
    return (Array.isArray(selectedPanelIds) ? selectedPanelIds : fallback).filter((id) =>
      customPanelIds.includes(id)
    );
  }
  if (Array.isArray(test.panelIds) && test.panelIds.length) {
    return test.panelIds;
  }
  return [];
}

function resolveTestWhatsTested(test, selectedPanelIds) {
  const panelIds = resolveTestPanelIds(test, selectedPanelIds);
  if (panelIds.length && typeof window.buildPanelsWhatsTested === "function") {
    return window.buildPanelsWhatsTested(panelIds);
  }
  return normalizeWhatsTested(test);
}

function calculateBundlePrice(test, selectedPanelIds) {
  if (!test?.customizable) {
    return Number(test?.price || 0);
  }

  const catalog = getPanelCatalog();
  const customPanelIds = getCustomPanelIds(test);
  const fallback = getDefaultCustomSelection(test);
  const selectedIds = (Array.isArray(selectedPanelIds) ? selectedPanelIds : fallback).filter((id) =>
    customPanelIds.includes(id)
  );
  return selectedIds.reduce((sum, id) => sum + Number(catalog[id]?.price || 0), 0);
}

function readCustomSelection(slug) {
  try {
    const parsed = JSON.parse(localStorage.getItem("drswift_custom_panels") || "{}");
    return Array.isArray(parsed[slug]) ? parsed[slug] : [];
  } catch {
    return [];
  }
}

function readCustomSelectionForTest(test) {
  const customPanelIds = getCustomPanelIds(test);
  const defaults = getDefaultCustomSelection(test);
  try {
    const parsed = JSON.parse(localStorage.getItem("drswift_custom_panels") || "{}");
    if (Object.prototype.hasOwnProperty.call(parsed, test.slug) && Array.isArray(parsed[test.slug])) {
      return parsed[test.slug].filter((id) => customPanelIds.includes(id));
    }
  } catch {
    return defaults;
  }
  return defaults;
}

function writeCustomSelection(slug, panelIds) {
  try {
    const parsed = JSON.parse(localStorage.getItem("drswift_custom_panels") || "{}");
    parsed[slug] = panelIds;
    localStorage.setItem("drswift_custom_panels", JSON.stringify(parsed));
  } catch {
    // Ignore storage failures in private browsing.
  }
}

function normalizeWhatsTested(test) {
  if (Array.isArray(test.whatsTested) && test.whatsTested.length) {
    return test.whatsTested.map((group) => ({
      title: group.title || "Included markers",
      description: group.description || "",
      markers: Array.isArray(group.markers) ? group.markers.map(normalizeMarker) : []
    }));
  }

  if (Array.isArray(test.markers) && test.markers.length) {
    return [
      {
        title: "Included markers",
        description: "",
        markers: test.markers.map(normalizeMarker)
      }
    ];
  }

  return [];
}

function countWhatsTestedMarkers(groups) {
  return groups.reduce((total, group) => total + group.markers.length, 0);
}

function buildPanelPills(panelIds, modifier = "") {
  const catalog = getPanelCatalog();
  return (panelIds || [])
    .map((panelId) => {
      const panel = catalog[panelId];
      if (!panel) {
        return "";
      }
      return `
        <li class="panel-pill ${modifier}">
          <span>${escapeHtml(panel.title)}</span>
          <small>${escapeHtml(panel.testCode || "")}</small>
        </li>
      `;
    })
    .join("");
}

function panelGroupKey(group, index) {
  return String(group.id || group.panelId || index);
}

function formatIncludedSummary(markerCount, panelCount) {
  const markerLabel = `biomarker${markerCount === 1 ? "" : "s"}`;
  const panelLabel = panelCount === 1 ? "panel" : "panels";
  return `Currently included: ${markerCount} ${markerLabel} across ${panelCount} ${panelLabel}`;
}

function buildPanelDrawerMarkup(groups) {
  return `
    <div class="fixed-tested__drawer" data-panel-drawer hidden>
      <button class="fixed-tested__scrim" type="button" data-panel-drawer-close aria-label="Close test details"></button>
      <div class="fixed-tested__drawer-panel" role="dialog" aria-modal="true" aria-label="Test details" tabindex="-1">
        ${groups
          .map((group, index) => {
            const key = panelGroupKey(group, index);
            const markers = Array.isArray(group.markers) ? group.markers : [];
            return `
              <article class="fixed-tested__detail" data-panel-drawer-panel="${escapeHtml(key)}" hidden>
                <button class="fixed-tested__back" type="button" data-panel-drawer-close>Back</button>
                <header class="fixed-tested__detail-header">
                  <h3>${escapeHtml(group.title)}</h3>
                </header>
                <div class="fixed-tested__detail-body">
                  <p class="fixed-tested__section-title">About This Test</p>
                  ${
                    group.description
                      ? `<p class="fixed-tested__copy fixed-tested__copy--lead">${escapeHtml(group.description)}</p>`
                      : `<p class="fixed-tested__copy fixed-tested__copy--lead">Review the markers included in this panel.</p>`
                  }
                  <p class="fixed-tested__section-label">Markers measured · ${markers.length}</p>
                  <ul class="fixed-tested__marker-grid">
                    ${markers
                      .map((marker) => {
                        const item = normalizeMarker(marker);
                        return `
                          <li>
                            <strong>${escapeHtml(item.name)}</strong>
                            ${item.description ? `<span>${escapeHtml(item.description)}</span>` : ""}
                          </li>
                        `;
                      })
                      .join("")}
                  </ul>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function buildWhatsTested(groups) {
  if (!groups.length) {
    return `
      <div class="whats-tested">
        <p class="whats-tested__empty">Marker details for this panel will be published soon.</p>
      </div>
    `;
  }

  const markerCount = countWhatsTestedMarkers(groups);

  // Leaf tests: one parameter group — show a clean list (no drawer hop).
  if (groups.length === 1) {
    const markers = Array.isArray(groups[0].markers) ? groups[0].markers : [];
    return `
      <div class="whats-tested whats-tested--params">
        <p class="fixed-tested__meta">${markerCount} parameter${markerCount === 1 ? "" : "s"}</p>
        <ul class="whats-tested__param-list">
          ${markers
            .map((marker) => {
              const name = marker?.name || String(marker || "");
              const desc = marker?.description || "";
              return `<li>
                <strong>${escapeHtml(name)}</strong>
                ${desc ? `<span>${escapeHtml(desc)}</span>` : ""}
              </li>`;
            })
            .join("")}
        </ul>
      </div>
    `;
  }

  const groupLabel = "panels";

  return `
    <div class="whats-tested whats-tested--fixed" data-panel-drawer-root data-fixed-tested>
      <p class="fixed-tested__meta" data-marker-count>${markerCount} biomarker${markerCount === 1 ? "" : "s"} across ${groups.length} ${groupLabel}</p>
      <div class="fixed-tested__grid" aria-label="Included tests">
        ${groups
          .map((group, index) => {
            const key = panelGroupKey(group, index);
            const markerLabel = `${group.markers.length} marker${group.markers.length === 1 ? "" : "s"}`;
            return `
              <button class="fixed-tested__card" type="button" data-panel-drawer-open="${escapeHtml(key)}" aria-haspopup="dialog">
                <span class="fixed-tested__card-copy">
                  <span class="fixed-tested__card-title">${escapeHtml(group.title)}</span>
                  <span class="fixed-tested__card-meta">${escapeHtml(markerLabel)}</span>
                </span>
                <span class="fixed-tested__arrow" aria-hidden="true"></span>
              </button>
            `;
          })
          .join("")}
      </div>
      ${buildPanelDrawerMarkup(groups)}
    </div>
  `;
}

function buildCustomizeSection(test, selectedPanelIds) {
  const panelIds = getCustomPanelIds(test);
  if (!test.customizable || !panelIds.length) {
    return "";
  }

  const catalog = getPanelCatalog();
  const selected = new Set(selectedPanelIds);
  const livePrice = calculateBundlePrice(test, selectedPanelIds);
  const selectedGroups =
    typeof window.buildPanelsWhatsTested === "function"
      ? window.buildPanelsWhatsTested(selectedPanelIds)
      : [];
  const includedSummary = formatIncludedSummary(
    countWhatsTestedMarkers(selectedGroups),
    selectedGroups.length
  );
  const drawerGroups =
    typeof window.buildPanelsWhatsTested === "function"
      ? window.buildPanelsWhatsTested(panelIds)
      : panelIds.map((id) => catalog[id]).filter(Boolean);

  return `
    <div class="customize-shell customize-shell--cards" data-customize-section data-panel-drawer-root id="customize-panels">
      <div class="customize-shell__header customize-shell__header--cards">
        <div class="customize-shell__copy">
          <p class="customize-lead">Select the tests you want included. Use Read more to review biomarkers before you add a panel to cart.</p>
          <div class="customize-shell__meta">
            <p class="customize-count" data-selected-count>${selected.size} of ${panelIds.length} tests selected</p>
            <p class="customize-included" data-included-summary>${escapeHtml(includedSummary)}</p>
          </div>
        </div>
        <div class="customize-total" aria-live="polite">
          <span class="customize-total__label">Total</span>
          <strong class="customize-total__value" data-custom-total>${formatPrice(livePrice)}</strong>
        </div>
      </div>
      <div class="customize-card-grid" role="list">
        ${panelIds
          .map((panelId) => {
            const panel = catalog[panelId];
            if (!panel) {
              return "";
            }
            const checked = selected.has(panelId) ? "checked" : "";
            const markerCount = Array.isArray(panel.markers) ? panel.markers.length : 0;
            return `
              <article class="custom-test-card" role="listitem" data-custom-card>
                <div class="custom-test-card__frame">
                  <input
                    class="custom-test-card__input"
                    id="custom-panel-${escapeHtml(panelId)}"
                    type="checkbox"
                    name="custom-panel"
                    value="${escapeHtml(panelId)}"
                    ${checked}
                    data-custom-panel
                  >
                  <label class="custom-test-card__body" for="custom-panel-${escapeHtml(panelId)}">
                    <strong class="custom-test-card__title">${escapeHtml(panel.title)}</strong>
                    <span class="custom-test-card__meta">${markerCount} marker${markerCount === 1 ? "" : "s"}</span>
                    <span class="custom-test-card__copy">${escapeHtml(panel.description)}</span>
                  </label>
                  <div class="custom-test-card__footer">
                    <button class="custom-test-card__read" type="button" data-panel-drawer-open="${escapeHtml(panelId)}">Read more</button>
                    <span class="custom-test-card__price">${formatPrice(panel.price)}</span>
                    <label class="custom-test-card__check" for="custom-panel-${escapeHtml(panelId)}" aria-label="Toggle ${escapeHtml(panel.title)}"></label>
                  </div>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
      ${buildPanelDrawerMarkup(drawerGroups)}
    </div>
  `;
}

function buildPreparationCard(test) {
  const preparation = String(test?.preparation ?? "").trim()
    || "No special preparation required unless paired with another fasting test.";
  return `
    <div class="custom-preparation-card">
      <div>
        <p class="overline">Preparation</p>
        <h3>Before your sample collection</h3>
      </div>
      <p>${escapeHtml(preparation)}</p>
      <p class="detail-note">If you have urgent symptoms, active medical concerns, or abnormal prior results, speak with a qualified clinician before booking self-directed testing.</p>
    </div>
  `;
}

function buildReasonsSection(test) {
  const reasons = Array.isArray(test?.reasons) ? test.reasons : [];
  if (!reasons.length) {
    return "";
  }
  return `
    <section class="detail-section section-pad section-bg-soft">
      <div class="container">
        <div class="section-heading text-center">
          <p class="overline">Why this test</p>
          <h2>Common reasons people book this</h2>
        </div>
        <div class="steps-grid">
          ${reasons
            .map((reason) => {
              const title = Array.isArray(reason) ? reason[0] : reason?.title;
              const copy = Array.isArray(reason) ? reason[1] : reason?.copy;
              return `
                <article class="step-card">
                  <h3>${escapeHtml(title || "")}</h3>
                  <p>${escapeHtml(copy || "")}</p>
                </article>
              `;
            })
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function compareStatusCell(included, optional) {
  if (optional) {
    return `<span class="labcorp-compare__status labcorp-compare__status--opt">Optional</span>`;
  }
  if (included) {
    return `<span class="labcorp-compare__status labcorp-compare__status--yes" aria-label="Included"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7.7 14.3 3.5 10.1l1.4-1.4 2.8 2.8 7-7 1.4 1.4-8.4 8.4z"/></svg></span>`;
  }
  return `<span class="labcorp-compare__status labcorp-compare__status--no" aria-label="Not included">—</span>`;
}

function getComparePeerColumns(test, limit = 3) {
  if (!test) {
    return [];
  }
  const columns = [test];
  const seen = new Set([test.slug]);

  const push = (slug) => {
    if (!slug || seen.has(slug) || columns.length >= limit) {
      return;
    }
    const peer = getTestBySlug(slug);
    if (!peer) {
      return;
    }
    seen.add(slug);
    columns.push(peer);
  };

  push(test.compareWith);
  (test.related || []).forEach(push);

  if (columns.length < 2) {
    const filters = new Set(
      (test.filters || []).filter((f) => f && f !== "all" && f !== "men" && f !== "women")
    );
    TESTS.forEach((candidate) => {
      if (columns.length >= limit || seen.has(candidate.slug)) {
        return;
      }
      const sameCategory =
        String(candidate.category || "").toLowerCase() === String(test.category || "").toLowerCase();
      const overlap = (candidate.filters || []).some((f) => filters.has(f));
      if (sameCategory || overlap) {
        push(candidate.slug);
      }
    });
  }

  return columns.length >= 2 ? columns : [];
}

function markerDisplayName(marker) {
  return typeof marker === "string" ? marker.trim() : String(marker?.name || "").trim();
}

function getCompareUnitsForTest(test) {
  const units = [];
  const catalog = getPanelCatalog();
  const isProfile = String(test.testType || "").toLowerCase() === "profile";
  const panelIds = test.customizable
    ? getCustomPanelIds(test)
    : resolveTestPanelIds(test, test.customizable ? readCustomSelectionForTest(test) : []);

  if (panelIds.length > 1 || (isProfile && panelIds.length)) {
    panelIds.forEach((panelId) => {
      const panel = catalog[panelId];
      const groups = normalizeWhatsTested(test);
      const group = groups.find(
        (item, index) =>
          String(item.id || item.panelId || item.title || index) === String(panelId) ||
          String(item.title || "").toLowerCase() === String(panel?.title || "").toLowerCase()
      );
      units.push({
        key: `panel:${panelId}`,
        title: panel?.title || group?.title || panelId,
        description: panel?.description || group?.description || "",
        markers: panel?.markers || group?.markers || [],
        optional: false
      });
    });
    return units;
  }

  const groups = normalizeWhatsTested(test);
  const markers = groups[0]?.markers?.length
    ? groups[0].markers
    : (test.markers || []).map((marker) =>
        typeof marker === "string" ? { name: marker, description: "" } : marker
      );

  units.push({
    key: `test:${test.slug}`,
    title: test.shortName || test.name,
    description: test.summary || test.headline || test.description || "",
    markers,
    optional: false
  });
  return units;
}

/** Marker names included (or optional) for one compare column. */
function getCompareMarkerStatuses(columnEntry) {
  const byKey = new Map();
  columnEntry.units.forEach((unit) => {
    const included = columnEntry.includedKeys.has(unit.key);
    const optional = columnEntry.optionalKeys.has(unit.key);
    if (!included && !optional) {
      return;
    }
    (unit.markers || []).forEach((marker) => {
      const name = markerDisplayName(marker);
      if (!name) {
        return;
      }
      const key = name.toLowerCase();
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, { name, included, optional: optional && !included });
        return;
      }
      if (included) {
        existing.included = true;
        existing.optional = false;
      } else if (optional && !existing.included) {
        existing.optional = true;
      }
    });
  });
  return byKey;
}

function buildCompareSection(test) {
  const columns = getComparePeerColumns(test, 3);
  if (columns.length < 2) {
    return "";
  }

  const columnUnits = columns.map((column) => {
    const units = getCompareUnitsForTest(column);
    const includedKeys = new Set();
    const optionalKeys = new Set();

    if (column.customizable) {
      const allCustomIds = new Set(getCustomPanelIds(column));
      const baseIds = new Set(column.basePanelIds || []);
      const optionalIds = new Set(column.optionalPanelIds || []);
      units.forEach((unit) => {
        if (!unit.key.startsWith("panel:")) {
          includedKeys.add(unit.key);
          return;
        }
        const panelId = unit.key.slice("panel:".length);
        if (baseIds.has(panelId)) {
          includedKeys.add(unit.key);
          return;
        }
        if (optionalIds.has(panelId) || allCustomIds.has(panelId)) {
          optionalKeys.add(unit.key);
        }
      });
    } else {
      units.forEach((unit) => includedKeys.add(unit.key));
    }

    return { test: column, units, includedKeys, optionalKeys };
  });

  const columnMarkerMaps = columnUnits.map(getCompareMarkerStatuses);
  const markerOrder = [];
  const seenMarkers = new Set();
  columnMarkerMaps.forEach((map) => {
    map.forEach((value, key) => {
      if (seenMarkers.has(key)) {
        return;
      }
      seenMarkers.add(key);
      markerOrder.push(value.name);
    });
  });

  if (!markerOrder.length) {
    return "";
  }

  const categoryLabel =
    String(test.eyebrow || "").trim() ||
    String(test.category || "health").replace(/\s+test$/i, "") ||
    "health";
  const colTemplate = `minmax(140px, 1.5fr) ${columns.map(() => "minmax(88px, 1fr)").join(" ")}`;

  const rowHtml = markerOrder
    .map((name) => {
      const key = name.toLowerCase();
      const statusCells = columnMarkerMaps
        .map((map, columnIndex) => {
          const hit = map.get(key);
          const currentClass = columnIndex === 0 ? " labcorp-compare__col--current" : "";
          if (!hit) {
            return `<span class="labcorp-compare__cell${currentClass}">${compareStatusCell(false, false)}</span>`;
          }
          return `<span class="labcorp-compare__cell${currentClass}">${compareStatusCell(hit.included, hit.optional)}</span>`;
        })
        .join("");

      return `
        <div class="labcorp-compare__row labcorp-compare__row--marker" style="--compare-cols: ${colTemplate}">
          <span class="labcorp-compare__panel">
            <span class="labcorp-compare__marker-copy">
              <strong>${escapeHtml(name)}</strong>
            </span>
          </span>
          ${statusCells}
        </div>
      `;
    })
    .join("");

  return `
    <section class="detail-section section-pad section-bg-white" id="package-compare" data-labcorp-compare>
      <div class="container">
        <div class="section-heading">
          <p class="overline">Compare options</p>
          <h2>Compare ${escapeHtml(categoryLabel)} tests</h2>
          <p>See what’s included in this test versus similar or related options.</p>
        </div>

        <div class="labcorp-compare-wrap">
          <div class="labcorp-compare">
            <div class="labcorp-compare__head" role="row" style="--compare-cols: ${colTemplate}">
              <div class="labcorp-compare__head-label">What’s tested</div>
              ${columns
                .map((column, index) => {
                  const price = getTestLivePrice(column);
                  return `
                    <div class="labcorp-compare__head-product${index === 0 ? " labcorp-compare__col--current" : ""}">
                      ${index === 0 ? `<span class="labcorp-compare__you">This test</span>` : ""}
                      <p class="labcorp-compare__product-name">${escapeHtml(column.shortName || column.name)}</p>
                      <p class="labcorp-compare__product-price">${formatPrice(price)}</p>
                      ${
                        index === 0
                          ? ""
                          : `<a class="labcorp-compare__product-link" href="${detailUrl(column.slug)}">View details</a>`
                      }
                    </div>
                  `;
                })
                .join("")}
            </div>
            <div class="labcorp-compare__list">
              ${rowHtml}
            </div>
            <div class="labcorp-compare__foot" role="row" style="--compare-cols: ${colTemplate}">
              <div class="labcorp-compare__foot-spacer" aria-hidden="true"></div>
              ${columns
                .map((column, index) =>
                  index === 0
                    ? `<div class="labcorp-compare__foot-cell labcorp-compare__col--current" aria-hidden="true"></div>`
                    : `<div class="labcorp-compare__foot-cell">
                        <button class="button primary labcorp-compare__select" type="button" data-add-to-cart="${escapeHtml(column.slug)}">Select This Test</button>
                      </div>`
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function bindCustomPanelHandlers(test) {
  if (!test?.customizable) {
    return;
  }

  const section = document.querySelector("[data-customize-section]");
  if (!section) {
    return;
  }

  function syncSelection() {
    const selected = [...section.querySelectorAll("[data-custom-panel]:checked")].map((node) => node.value);
    writeCustomSelection(test.slug, selected);
    refreshCustomTestDetail(test, selected);
  }

  section.addEventListener("click", (event) => {
    const readMore = event.target.closest("[data-panel-drawer-open]");
    if (readMore) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const price = event.target.closest(".custom-test-card__price");
    const card = event.target.closest("[data-custom-card]");
    if (price && card) {
      const input = card.querySelector("[data-custom-panel]");
      if (input) {
        event.preventDefault();
        input.checked = !input.checked;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  });

  section.addEventListener("change", (event) => {
    const input = event.target.closest("[data-custom-panel]");
    if (!input) {
      return;
    }
    syncSelection();
  });
}

function bindPanelDrawerHandlers() {
  const roots = [...document.querySelectorAll("[data-panel-drawer-root]")];
  if (!roots.length) {
    return;
  }

  roots.forEach((root) => {
    const drawer = root.querySelector("[data-panel-drawer]");
    const drawerPanel = root.querySelector(".fixed-tested__drawer-panel");
    const panels = [...root.querySelectorAll("[data-panel-drawer-panel]")];
    const openers = [...root.querySelectorAll("[data-panel-drawer-open]")];
    let activeOpener = null;

    function activatePanel(key) {
      openers.forEach((opener) => {
        const isActive = opener.getAttribute("data-panel-drawer-open") === String(key);
        opener.classList.toggle("is-active", isActive);
      });

      panels.forEach((panel) => {
        panel.hidden = panel.getAttribute("data-panel-drawer-panel") !== String(key);
      });
    }

    function openDrawer(key, opener) {
      if (!drawer) {
        return;
      }
      activeOpener = opener || null;
      activatePanel(key);
      drawer.hidden = false;
      document.body.classList.add("drawer-open");
      drawerPanel?.focus({ preventScroll: true });
    }

    function closeDrawer() {
      if (!drawer || drawer.hidden) {
        return;
      }
      drawer.hidden = true;
      document.body.classList.remove("drawer-open");
      openers.forEach((opener) => opener.classList.remove("is-active"));
      activeOpener?.focus({ preventScroll: true });
      activeOpener = null;
    }

    root.addEventListener("click", (event) => {
      const opener = event.target.closest("[data-panel-drawer-open]");
      if (opener && root.contains(opener)) {
        event.preventDefault();
        event.stopPropagation();
        openDrawer(opener.getAttribute("data-panel-drawer-open"), opener);
        return;
      }

      const close = event.target.closest("[data-panel-drawer-close]");
      if (close && root.contains(close)) {
        closeDrawer();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && drawer && !drawer.hidden) {
        closeDrawer();
      }
    });
  });
}

function refreshCustomTestDetail(test, selectedPanelIds) {
  const livePrice = calculateBundlePrice(test, selectedPanelIds);
  const savings = Math.max(0, Number(test.oldPrice || 0) - livePrice);
  const groups = resolveTestWhatsTested(test, selectedPanelIds);
  const markerCount = countWhatsTestedMarkers(groups);
  const selectedCount = Array.isArray(selectedPanelIds) ? selectedPanelIds.length : getCustomPanelIds(test).length;
  const totalCount = getCustomPanelIds(test).length;

  const priceNode = document.querySelector("[data-live-price]");
  const savingsNode = document.querySelector("[data-live-savings]");
  const customTotalNode = document.querySelector("[data-custom-total]");
  const selectedCountNode = document.querySelector("[data-selected-count]");
  const includedSummaryNode = document.querySelector("[data-included-summary]");

  if (priceNode) {
    priceNode.textContent = formatPrice(livePrice);
  }
  if (customTotalNode) {
    customTotalNode.textContent = formatPrice(livePrice);
  }
  if (selectedCountNode) {
    selectedCountNode.textContent = `${selectedCount} of ${totalCount} tests selected`;
  }
  if (includedSummaryNode) {
    includedSummaryNode.textContent = formatIncludedSummary(markerCount, groups.length);
  }
  if (savingsNode) {
    savingsNode.textContent =
      savings > 0 ? `Save ${formatPrice(savings)} today.` : "Transparent pricing before booking.";
  }
}

function buildRelatedCard(slug) {
  const test = getTestBySlug(slug);
  if (!test) {
    return "";
  }
  return buildCatalogCard(test);
}

function renderTestDetailPage() {
  const main = document.querySelector("[data-test-detail]");
  if (!main || !TESTS.length) {
    return;
  }

  const slug = resolveDetailSlug() || TESTS[0].slug;
  const test = getTestBySlug(slug);

  if (!test) {
    main.innerHTML = `
      <section class="section-pad">
        <div class="container not-found-panel">
          <p class="eyebrow">Test not found</p>
          <h1>We could not find that test.</h1>
          <p>Browse the full catalog or message the care team for help choosing a panel.</p>
          <div class="hero-actions">
            <a class="button primary" href="/tests">Book a test</a>
            <a class="button secondary" href="/whatsapp">WhatsApp us</a>
          </div>
        </div>
      </section>
    `;
    return;
  }

  document.title = `${test.name} | Dr.Swift Diagnostics`;
  const selectedPanelIds = test.customizable ? readCustomSelectionForTest(test) : [];
  const livePrice = test.customizable ? calculateBundlePrice(test, selectedPanelIds) : Number(test.price || 0);
  const savings = Math.max(0, Number(test.oldPrice || 0) - livePrice);
  const whatsTestedGroups = resolveTestWhatsTested(test, selectedPanelIds);
  const customizeCta = test.customizable
    ? `<a class="button secondary full" href="#customize-panels">Customize your test</a>`
    : "";

  main.innerHTML = `
    <section class="product-hero section-pad" data-test-slug="${escapeHtml(test.slug)}">
      <div class="container product-hero__grid">
        <div class="product-intro">
          <nav class="breadcrumbs" aria-label="Breadcrumb">
            <a href="index.html">Home</a>
            <span>/</span>
            <a href="tests.html">Tests</a>
            <span>/</span>
            <span>${escapeHtml(test.name)}</span>
          </nav>
          <p class="eyebrow">${escapeHtml(detailEyebrow(test))}</p>
          <h1>${escapeHtml(test.name)}</h1>
          <p class="product-headline">${escapeHtml(test.headline)}</p>
        </div>
        <aside class="product-buy-card" aria-label="Book ${escapeHtml(test.name)}">
          <div class="product-price">
            <span data-live-price>${formatPrice(livePrice)}</span>
            ${hasDiscountPrice(test, livePrice) ? `<del>${formatPrice(test.oldPrice)}</del>` : ""}
          </div>
          <p data-live-savings>${savings > 0 ? `Save ${formatPrice(savings)} today.` : "Transparent pricing before booking."}</p>
          <ul class="product-assurance" aria-label="Booking assurances">
            <li>At-home sample collection</li>
            <li>Preparation guidance before collection</li>
            <li>Partner-lab processing and digital reports</li>
          </ul>
          ${customizeCta}
          <button class="button primary full" type="button" data-add-to-cart="${escapeHtml(test.slug)}">Add to cart</button>
          <a class="button secondary full" href="/book?test=${encodeURIComponent(test.name)}">Book now</a>
          <a class="cart-inline-link" href="/cart">View cart</a>
        </aside>
        <div class="product-media photo-thumb photo-thumb--${escapeHtml(test.imageTone || "blood")}">
          <img src="${escapeHtml(test.image)}" alt="" decoding="async">
          <span class="test-badge test-badge--category">${escapeHtml(test.category)}</span>
          ${test.customizable ? '<span class="test-badge test-badge--popular">Customizable</span>' : ""}
        </div>
        <p class="product-description">${escapeHtml(test.description)}</p>
      </div>
    </section>

    <section class="section-pad-sm">
      <div class="container">
        <ul class="detail-facts" aria-label="Test facts">
          ${buildFact("icon-tube", "Sample type", test.sampleType)}
          ${buildFact("icon-home", "Collection", test.collection)}
          ${buildFact("icon-family", "Age", test.age)}
          ${buildFact("icon-clock", "Results", test.results)}
          ${buildFact("icon-document", "Booking", test.purchaser || "Online")}
        </ul>
      </div>
    </section>

    <section class="detail-section ${test.customizable ? "detail-section--editable" : "detail-section--fixed"} section-pad section-bg-white" id="whats-tested">
      <div class="container detail-layout ${test.customizable ? "detail-layout--editable" : "detail-layout--fixed"}">
        <div class="detail-copy">
          <p class="overline">${test.customizable ? "Build your test" : "About this test"}</p>
          <h2>What's tested</h2>
          <p class="whats-tested__intro">${escapeHtml(test.description)}</p>
          ${test.customizable ? buildCustomizeSection(test, selectedPanelIds) : ""}
          ${test.customizable ? "" : buildWhatsTested(whatsTestedGroups)}
          ${buildPreparationCard(test)}
        </div>
      </div>
    </section>

    ${buildReasonsSection(test)}

    ${buildCompareSection(test)}

    <section class="detail-section section-pad section-bg-white">
      <div class="container">
        <div class="section-heading text-center">
          <p class="overline">How it works</p>
          <h2>From cart to clear results</h2>
        </div>
        <div class="steps-grid">
          <article class="step-card">
            <span>1</span>
            <h3>Add tests</h3>
            <p>Build your cart online and choose the panels you need.</p>
          </article>
          <article class="step-card">
            <span>2</span>
            <h3>Schedule collection</h3>
            <p>Share patient and address details during booking for at-home collection.</p>
          </article>
          <article class="step-card">
            <span>3</span>
            <h3>View results</h3>
            <p>Get app-ready reports with trends, plain-language notes, and family profiles.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="detail-section section-pad section-bg-soft">
      <div class="container">
        <div class="section-heading split">
          <div>
            <p class="overline">Frequently bought together</p>
            <h2>Related tests</h2>
          </div>
          <a class="button secondary" href="tests.html">Book a test</a>
        </div>
        <div class="related-grid">
          ${(test.related || []).map(buildRelatedCard).join("")}
        </div>
      </div>
    </section>

    <section class="detail-section section-pad section-bg-white">
      <div class="container faq-container">
        <p class="overline">FAQ</p>
        <h2>Common questions</h2>
        <div class="detail-faq-list">
          ${(test.faqs || [])
            .map((faq) => {
              const question = Array.isArray(faq) ? faq[0] : faq?.question;
              const answer = Array.isArray(faq) ? faq[1] : faq?.answer;
              return `
                <details>
                  <summary>${escapeHtml(question || "")}</summary>
                  <p>${escapeHtml(answer || "")}</p>
                </details>
              `;
            })
            .join("")}
        </div>
      </div>
    </section>
  `;

  bindCustomPanelHandlers(test);
  bindPanelDrawerHandlers();
}

function cartLineItems() {
  return readCart()
    .map((item) => ({ ...item, test: getTestBySlug(item.slug) }))
    .filter((item) => item.test);
}

function cartTotals(items) {
  return items.reduce(
    (totals, item) => {
      const unitPrice = getTestLivePrice(item.test, item.customPanels);
      const unitOriginal = hasDiscountPrice(item.test, unitPrice)
        ? Number(item.test.oldPrice)
        : unitPrice;
      totals.subtotal += unitPrice * item.quantity;
      totals.original += unitOriginal * item.quantity;
      return totals;
    },
    { subtotal: 0, original: 0 }
  );
}

function cartHousehold() {
  if (!hasLocalAccountSession()) {
    return null;
  }
  try {
    return (
      JSON.parse(localStorage.getItem("drswift.demoHousehold.v1") || "null") ||
      JSON.parse(sessionStorage.getItem("drswift.demoHousehold.v1") || "null")
    );
  } catch {
    return null;
  }
}

function cartUserName() {
  const name = String(window.DRSWIFT_USER?.displayName || "").trim();
  const household = cartHousehold();
  const ownerName = String(household?.owner?.name || "").trim();
  return name || ownerName || "Me";
}

function cartRecipientOptions() {
  const household = cartHousehold();
  if (household?.owner || Array.isArray(household?.members)) {
    const people = [
      household.owner ? { ...household.owner, relation: "Self" } : { name: cartUserName(), relation: "Self" },
      ...(Array.isArray(household.members) ? household.members : []),
    ];
    return people
      .filter((person) => String(person.name || "").trim())
      .map((person) => {
        const name = String(person.name || "").trim();
        const relation = String(person.relation || "").trim();
        return relation && relation !== "Self" ? `${name} (${relation})` : name;
      });
  }
  return [cartUserName(), "Parent", "Partner", "Child"];
}

function writeCartRecipient(slug, recipient) {
  const cart = readCart();
  const item = cart.find((entry) => entry.slug === slug);
  if (!item) {
    return;
  }
  item.recipient = recipient;
  writeCart(cart);
}

function cartFamilyBannerHtml(cartTotal = 0) {
  const isSignedIn = Boolean(window.DRSWIFT_USER);
  const familySaveAmount = Math.round(Number(cartTotal || 0) * 0.15);
  const familySaveText =
    familySaveAmount > 0
      ? ` That’s additional ${formatPrice(familySaveAmount)}.`
      : "";
  return `
    <section class="cart-family-banner" aria-label="Family booking account setup">
      <div class="cart-family-banner__visual">
        <picture>
          <source srcset="assets/images/wellness-family.webp" type="image/webp">
          <img
            src="assets/images/wellness-family.jpg"
            alt="Family reviewing health profiles together at home"
            loading="lazy"
            decoding="async"
            width="560"
            height="420"
          >
        </picture>
      </div>
      <div class="cart-family-banner__content">
        <h2>Book Together. Save 15%.</h2>
        <p>Create your free Dr. Swift account to book tests for you and a family member.</p>
        <p class="cart-family-saving">
          <svg class="ui-icon" aria-hidden="true"><use href="assets/images/ui-icons.svg#icon-price"></use></svg>
          <strong>Add a family member and everyone in this booking gets 15% family savings.${familySaveText}</strong>
        </p>
      </div>
      <div class="cart-family-banner__actions">
        ${
          isSignedIn
            ? `<a class="button primary" href="account.html">Manage Family Members</a>`
            : `<a class="button primary" href="signup.html">Create Account &amp; Save 15%</a>`
        }
        <a class="cart-family-skip" href="/book?cart=checkout">${isSignedIn ? "Continue to checkout" : "Continue without an account"}</a>
      </div>
    </section>
  `;
}

let cartRevealTimer = null;
let cartBodyRevealed = false;

function prefersCartReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
}

function setCartBodyVisible(visible, animate = false) {
  const hero = document.querySelector(".cart-hero");
  const cartSection = document.querySelector(".cart-section");
  if (hero) {
    hero.hidden = !visible;
    if (animate) hero.classList.add("is-cart-revealed");
  }
  if (cartSection) {
    cartSection.hidden = !visible;
    if (animate) cartSection.classList.add("is-cart-revealed");
  }
}

function scheduleCartBodyReveal() {
  if (cartBodyRevealed) {
    setCartBodyVisible(true);
    return;
  }
  if (prefersCartReducedMotion()) {
    cartBodyRevealed = true;
    setCartBodyVisible(true);
    return;
  }
  setCartBodyVisible(false);
  window.clearTimeout(cartRevealTimer);
  cartRevealTimer = window.setTimeout(() => {
    cartBodyRevealed = true;
    setCartBodyVisible(true, true);
  }, 3000);
}

function cartRecipientControlHtml(item) {
  const hasAccountProfiles = Boolean(window.DRSWIFT_USER) || Boolean(cartHousehold());
  if (!hasAccountProfiles) {
    return "";
  }

  const options = cartRecipientOptions();
  const selected = options.includes(item.recipient) ? item.recipient : options[0];
  if (selected && item.recipient !== selected) {
    writeCartRecipient(item.slug, selected);
  }
  return `
    <div class="cart-recipient">
      <label for="cart-recipient-${escapeHtml(item.slug)}">Book for</label>
      <select id="cart-recipient-${escapeHtml(item.slug)}" data-cart-recipient="${escapeHtml(item.slug)}">
        ${options
          .map(
            (option) =>
              `<option value="${escapeHtml(option)}"${option === selected ? " selected" : ""}>${escapeHtml(option)}</option>`
          )
          .join("")}
      </select>
      <a href="signup.html?mode=family">Add family member</a>
    </div>
  `;
}

function renderCartPage() {
  const container = document.querySelector("[data-cart-page]");
  const familySection = document.querySelector("[data-cart-family-section]");
  const familyBanner = document.querySelector("[data-cart-family-banner]");
  if (!container || !TESTS.length) {
    return;
  }

  const items = cartLineItems();
  if (!items.length) {
    window.clearTimeout(cartRevealTimer);
    cartBodyRevealed = false;
    if (familySection) familySection.hidden = true;
    if (familyBanner) familyBanner.innerHTML = "";
    setCartBodyVisible(true);
    container.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart__illustration" aria-hidden="true">
          <svg class="ui-icon"><use href="assets/images/ui-icons.svg#icon-basket-plus"></use></svg>
        </div>
        <p class="eyebrow">Empty cart</p>
        <h2>Your cart is ready for tests.</h2>
        <p>Add one or more panels, then continue to booking for patient and collection details.</p>
        <div class="hero-actions">
          <a class="button primary" href="tests.html">Book a test</a>
          <a class="button secondary" href="whatsapp.html">Book via WhatsApp</a>
        </div>
      </div>
    `;
    return;
  }

  const totals = cartTotals(items);
  const savings = Math.max(0, totals.original - totals.subtotal);

  if (familyBanner) {
    familyBanner.innerHTML = cartFamilyBannerHtml(totals.subtotal);
  }
  if (familySection) {
    familySection.hidden = false;
  }

  container.innerHTML = `
    <div class="cart-items" aria-label="Selected tests">
      ${items
        .map((item) => {
          const { test } = item;
          const unitPrice = getTestLivePrice(test, item.customPanels);
          return `
            <article class="cart-item">
              <a class="cart-item__image photo-thumb photo-thumb--${escapeHtml(test.imageTone || "blood")}" href="${detailUrl(test.slug)}">
                <img src="${escapeHtml(test.image)}" alt="" loading="lazy" decoding="async">
              </a>
              <div class="cart-item__body">
                <p class="overline">${escapeHtml(test.category)}</p>
                <h2><a href="${detailUrl(test.slug)}">${escapeHtml(test.name)}</a></h2>
                <p>${escapeHtml(test.summary)}</p>
                ${cartRecipientControlHtml(item)}
              </div>
              <div class="cart-item__controls">
                <div class="price-row">
                  <span class="price">${formatPrice(unitPrice)}</span>
                  ${formatOldPriceHtml(test, unitPrice)}
                </div>
                <button class="cart-remove" type="button" data-cart-action="remove" data-cart-slug="${escapeHtml(test.slug)}">Remove</button>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
    <aside class="cart-summary" aria-label="Cart summary">
      <h2>Order summary</h2>
      <p class="cart-summary__mobile-total"><span>Total</span><strong>${formatPrice(totals.subtotal)}</strong></p>
      <dl>
        <div><dt>Tests</dt><dd>${items.length}</dd></div>
        <div><dt>Subtotal</dt><dd>${formatPrice(totals.original)}</dd></div>
        <div><dt>Savings</dt><dd>-${formatPrice(savings)}</dd></div>
        <div class="cart-summary__total"><dt>Total</dt><dd>${formatPrice(totals.subtotal)}</dd></div>
      </dl>
      <ul class="cart-assurance cart-assurance--strip">
        <li>
          <span class="cart-assurance__icon" aria-hidden="true"><svg class="ui-icon"><use href="assets/images/ui-icons.svg#icon-house-heart"></use></svg></span>
          <span>Home collection</span>
        </li>
        <li>
          <span class="cart-assurance__icon" aria-hidden="true"><svg class="ui-icon"><use href="assets/images/ui-icons.svg#icon-lock-check"></use></svg></span>
          <span>Secure checkout</span>
        </li>
        <li>
          <span class="cart-assurance__icon" aria-hidden="true"><svg class="ui-icon"><use href="assets/images/ui-icons.svg#icon-calendar-refresh"></use></svg></span>
          <span>Easy reschedule</span>
        </li>
      </ul>
      <a class="button primary full" href="/book?cart=checkout">Continue to booking</a>
      <button class="cart-clear-link" type="button" data-cart-action="clear">Clear cart</button>
    </aside>
  `;

  scheduleCartBodyReveal();
}

document.addEventListener("change", (event) => {
  const recipientSelect = event.target.closest("[data-cart-recipient]");
  if (!recipientSelect) {
    return;
  }
  writeCartRecipient(
    recipientSelect.getAttribute("data-cart-recipient"),
    recipientSelect.value
  );
  showCartToast(`This test is set for ${recipientSelect.value}.`);
});

window.addEventListener("drswift:auth-changed", () => {
  syncAccountNav();
  renderCartPage();
});

document.addEventListener("click", (event) => {
  const accountToggle = event.target.closest("[data-nav-account-toggle]");
  if (accountToggle) {
    event.preventDefault();
    const menu = accountToggle.closest("[data-nav-account-menu]");
    const shouldOpen = !menu?.classList.contains("is-open");
    closeAccountMenus(menu);
    setAccountMenuOpen(menu, shouldOpen);
    return;
  }

  const accountMenu = event.target.closest("[data-nav-account-menu]");
  if (!accountMenu) {
    closeAccountMenus();
  }

  const logoutButton = event.target.closest("[data-account-logout]");
  if (logoutButton) {
    event.preventDefault();
    closeAccountMenus();
    logoutAccountSession();
    return;
  }

  const addButton = event.target.closest("[data-add-to-cart]");
  if (addButton) {
    event.preventDefault();
    event.stopPropagation();
    const slug = addButton.getAttribute("data-add-to-cart");
    const test = getTestBySlug(slug);
    if (test) {
      const result = addToCart(slug);
      renderCartPage();
      if (result === "exists") {
        showCartToast(`${test.name} is already in your cart.`);
      } else if (result === "added") {
        showCartToast(`${test.name} added to cart.`);
      }
    }
    return;
  }

  const catalogCard = event.target.closest(".test-card--catalog[data-detail-url]");
  if (catalogCard && !event.target.closest("a, button")) {
    window.location.href = catalogCard.getAttribute("data-detail-url");
    return;
  }

  const cartButton = event.target.closest("[data-cart-action]");
  if (cartButton) {
    updateCartItem(
      cartButton.getAttribute("data-cart-slug"),
      cartButton.getAttribute("data-cart-action")
    );
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAccountMenus();
  }
});

function renderHomeFeatured() {
  const rail = document.querySelector("[data-home-featured]");
  if (!rail) {
    return;
  }
  const featured = TESTS.filter((test) => Boolean(test.frequentlyOrderedTest));
  rail.innerHTML = featured.length
    ? featured.map(buildCatalogCard).join("")
    : "";
}

async function bootStorefront() {
  if (typeof window.DRSWIFT_BOOTSTRAP_CATALOG === "function") {
    await window.DRSWIFT_BOOTSTRAP_CATALOG();
  }
  TESTS = Array.isArray(window.DRSWIFT_TESTS) ? window.DRSWIFT_TESTS : [];
  renderHomeFeatured();
  renderTestsCatalog();
  renderTestDetailPage();
  renderCartPage();
  renderPromotionsPage();
  updateCartBadges();
  syncAccountNav();
}

function renderPromotionsPage() {
  const grid = document.querySelector("[data-promo-grid]");
  if (!grid) {
    return;
  }
  const promotions = Array.isArray(window.DRSWIFT_PROMOTIONS) ? window.DRSWIFT_PROMOTIONS : [];
  if (!promotions.length) {
    grid.innerHTML = `
      <article class="promo-card">
        <span class="promo-card__badge">Offers</span>
        <h3>No active promotions right now</h3>
        <p>Mark tests as promotional in the CMS to show seasonal packages here. Browse the full catalog meanwhile.</p>
        <a class="button primary full" href="tests.html">Book a test</a>
      </article>
    `;
    return;
  }
  grid.innerHTML = promotions
    .map((promo) => {
      const href = promo.slug ? detailUrl(promo.slug) : "tests.html";
      const priceRow =
        promo.price > 0
          ? `<div class="price-row"><span class="price">${formatPrice(promo.price)}</span>${
              promo.oldPrice && promo.oldPrice > promo.price
                ? `<span class="old-price">${formatPrice(promo.oldPrice)}</span>`
                : ""
            }</div>`
          : "";
      return `
        <article class="promo-card">
          <span class="promo-card__badge">${escapeHtml(promo.badge || "Offer")}</span>
          <h3>${escapeHtml(promo.title)}</h3>
          <p>${escapeHtml(promo.subtitle || "")}</p>
          ${promo.dateRange ? `<p class="detail-note">${escapeHtml(promo.dateRange)}</p>` : ""}
          ${priceRow}
          <a class="button primary full" href="${href}">View offer</a>
        </article>
      `;
    })
    .join("");
}

bootStorefront();
