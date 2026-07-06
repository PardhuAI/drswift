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

const panSection = document.querySelector(".quick-select");
const panTarget = document.getElementById("quick-cards");

// Shared so category auto-scroll pauses while the user is manually dragging the cards.
let isDraggingCards = false;

if (panSection && panTarget && !prefersReducedMotion) {
  const AUTO_SCROLL_SPEED = 0.55;
  const AUTO_RESUME_DELAY_MS = 1400;
  let isAutoPaused = false;
  let isSectionVisible = true;
  let resumeTimer = null;

  function pauseCategoryAutoScroll() {
    isAutoPaused = true;
    window.clearTimeout(resumeTimer);
  }

  function resumeCategoryAutoScroll(delay = AUTO_RESUME_DELAY_MS) {
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => {
      isAutoPaused = false;
    }, delay);
  }

  function autoScrollTick() {
    const maxScroll = panTarget.scrollWidth - panTarget.clientWidth;
    if (
      isSectionVisible &&
      !isAutoPaused &&
      !isDraggingCards &&
      document.visibilityState === "visible" &&
      maxScroll > 8
    ) {
      if (panTarget.scrollLeft >= maxScroll - 1) {
        panTarget.scrollLeft = 0;
      } else {
        panTarget.scrollLeft += AUTO_SCROLL_SPEED;
      }
    }

    requestAnimationFrame(autoScrollTick);
  }

  panTarget.style.scrollSnapType = "none";
  panTarget.style.scrollBehavior = "auto";

  panTarget.addEventListener("mouseenter", pauseCategoryAutoScroll);
  panTarget.addEventListener("mouseleave", () => resumeCategoryAutoScroll());
  panTarget.addEventListener("focusin", pauseCategoryAutoScroll);
  panTarget.addEventListener("focusout", () => resumeCategoryAutoScroll());
  panTarget.addEventListener("touchstart", pauseCategoryAutoScroll, { passive: true });
  panTarget.addEventListener("touchend", () => resumeCategoryAutoScroll(2200), { passive: true });
  panTarget.addEventListener("wheel", () => {
    pauseCategoryAutoScroll();
    resumeCategoryAutoScroll(2200);
  }, { passive: true });

  const autoScrollObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries.find((item) => item.target === panSection);
      isSectionVisible = entry ? entry.isIntersecting : true;
    },
    { threshold: 0.15 }
  );

  autoScrollObserver.observe(panSection);
  requestAnimationFrame(autoScrollTick);
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
    const categories = card.getAttribute("data-category") || "";
    const haystack = card.getAttribute("data-search") || card.textContent || "";
    const matchesFilter = filter === "all" || categories.split(/\s+/).includes(filter);
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

  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.getAttribute("data-filter") === filter);
  });

}

function setCatalogFilter(filter) {
  activeCatalogFilter = filter;
  applyCatalogFilter(filter);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setCatalogFilter(button.getAttribute("data-filter") || "all");
  });
});

catalogSearch?.addEventListener("input", () => {
  applyCatalogFilter(activeCatalogFilter);
});

// Test storefront, detail page, and cart
const TESTS = Array.isArray(window.DRSWIFT_TESTS) ? window.DRSWIFT_TESTS : [];
const CART_STORAGE_KEY = "drswift.cart.v1";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(0)}`;
}

function detailUrl(slug) {
  return `test-details.html?test=${encodeURIComponent(slug)}`;
}

function getTestBySlug(slug) {
  return TESTS.find((test) => test.slug === slug);
}

function readCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter((item) => item && item.slug && (!TESTS.length || getTestBySlug(item.slug)))
      .map((item) => ({
        slug: item.slug,
        quantity: Math.max(1, Number(item.quantity) || 1),
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
  return readCart().reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartBadges() {
  const count = cartQuantity();
  document.querySelectorAll("[data-cart-count]").forEach((badge) => {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  });
}

function addToCart(slug) {
  if (!getTestBySlug(slug)) {
    return;
  }
  const cart = readCart();
  const existing = cart.find((item) => item.slug === slug);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ slug, quantity: 1 });
  }
  writeCart(cart);
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

  if (action === "increase") {
    item.quantity += 1;
  }

  if (action === "decrease") {
    item.quantity -= 1;
  }

  if (action === "remove" || item.quantity <= 0) {
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
  return `
    <article class="test-card test-card--catalog" data-category="${escapeHtml(filters)}" data-search="${escapeHtml(searchText)}">
      <a class="test-image photo-thumb photo-thumb--${escapeHtml(test.imageTone || "blood")}" href="${detailUrl(test.slug)}" aria-label="View ${escapeHtml(test.name)} details">
        <img src="${escapeHtml(test.image)}" alt="" loading="lazy" decoding="async">
        ${badge}
        <span class="test-badge test-badge--category">${escapeHtml(test.category)}</span>
      </a>
      <div class="test-body">
        <h3><a href="${detailUrl(test.slug)}">${escapeHtml(test.name)}</a></h3>
        <p>${escapeHtml(test.summary)}</p>
        <ul class="test-meta">
          <li>${escapeHtml(test.collection)}</li>
          <li>${escapeHtml(test.results.replace(" after sample reaches the lab", ""))}</li>
        </ul>
        <div class="price-row">
          <span class="price">${formatPrice(test.price)}</span>
          <span class="old-price">${formatPrice(test.oldPrice)}</span>
        </div>
        <div class="test-card-actions">
          <button class="button primary full" type="button" data-add-to-cart="${escapeHtml(test.slug)}">Add to cart</button>
        </div>
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
  applyCatalogFilter("all");
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

function buildRelatedCard(slug) {
  const test = getTestBySlug(slug);
  if (!test) {
    return "";
  }
  return `
    <article class="related-test">
      <a class="related-test__image photo-thumb photo-thumb--${escapeHtml(test.imageTone || "blood")}" href="${detailUrl(test.slug)}">
        <img src="${escapeHtml(test.image)}" alt="" loading="lazy" decoding="async">
      </a>
      <div>
        <p class="overline">${escapeHtml(test.category)}</p>
        <h3><a href="${detailUrl(test.slug)}">${escapeHtml(test.name)}</a></h3>
        <p>${escapeHtml(test.summary)}</p>
        <div class="price-row">
          <span class="price">${formatPrice(test.price)}</span>
          <span class="old-price">${formatPrice(test.oldPrice)}</span>
        </div>
      </div>
    </article>
  `;
}

function renderTestDetailPage() {
  const main = document.querySelector("[data-test-detail]");
  if (!main || !TESTS.length) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("test") || TESTS[0].slug;
  const test = getTestBySlug(slug);

  if (!test) {
    main.innerHTML = `
      <section class="section-pad">
        <div class="container not-found-panel">
          <p class="eyebrow">Test not found</p>
          <h1>We could not find that test.</h1>
          <p>Browse the full catalog or message the care team for help choosing a panel.</p>
          <div class="hero-actions">
            <a class="button primary" href="tests.html">Shop tests</a>
            <a class="button secondary" href="whatsapp.html">WhatsApp us</a>
          </div>
        </div>
      </section>
    `;
    return;
  }

  document.title = `${test.name} | Dr.Swift Diagnostics`;
  const savings = Math.max(0, Number(test.oldPrice || 0) - Number(test.price || 0));

  main.innerHTML = `
    <section class="product-hero section-pad">
      <div class="container product-hero__grid">
        <div class="product-intro">
          <nav class="breadcrumbs" aria-label="Breadcrumb">
            <a href="index.html">Home</a>
            <span>/</span>
            <a href="tests.html">Tests</a>
            <span>/</span>
            <span>${escapeHtml(test.name)}</span>
          </nav>
          <p class="eyebrow">${escapeHtml(test.category)} test</p>
          <h1>${escapeHtml(test.name)}</h1>
          <p class="product-headline">${escapeHtml(test.headline)}</p>
        </div>
        <aside class="product-buy-card" aria-label="Book ${escapeHtml(test.name)}">
          <div class="product-price">
            <span>${formatPrice(test.price)}</span>
            <del>${formatPrice(test.oldPrice)}</del>
          </div>
          <p>${savings > 0 ? `Save ${formatPrice(savings)} today.` : "Transparent pricing before booking."}</p>
          <button class="button primary full" type="button" data-add-to-cart="${escapeHtml(test.slug)}">Add to cart</button>
          <a class="button secondary full" href="book.html?test=${encodeURIComponent(test.name)}">Book now</a>
          <a class="cart-inline-link" href="cart.html">View cart</a>
        </aside>
        <div class="product-media photo-thumb photo-thumb--${escapeHtml(test.imageTone || "blood")}">
          <img src="${escapeHtml(test.image)}" alt="" decoding="async">
          <span class="test-badge test-badge--category">${escapeHtml(test.category)}</span>
        </div>
        <p class="product-description">${escapeHtml(test.description)}</p>
      </div>
    </section>

    <section class="section-pad-sm">
      <div class="container">
        <ul class="detail-facts" aria-label="Test facts">
          ${buildFact("icon-price", "Sample type", test.sampleType)}
          ${buildFact("icon-home", "Collection", test.collection)}
          ${buildFact("icon-family", "Age", test.age)}
          ${buildFact("icon-clock", "Results", test.results)}
          ${buildFact("icon-shield-check", "HSA/FSA", test.hsa)}
          ${buildFact("icon-document", "Booking", test.purchaser)}
        </ul>
      </div>
    </section>

    <section class="detail-section section-pad section-bg-white">
      <div class="container detail-layout">
        <div class="detail-copy">
          <p class="overline">Test details</p>
          <h2>What's tested</h2>
          <p>${escapeHtml(test.description)}</p>
          <ul class="marker-list">
            ${test.markers.map((marker) => `<li>${escapeHtml(marker)}</li>`).join("")}
          </ul>
        </div>
        <aside class="preparation-panel">
          <h2>Preparation</h2>
          <p>${escapeHtml(test.preparation)}</p>
          <p class="detail-note">If you have urgent symptoms, active medical concerns, or abnormal prior results, speak with a qualified clinician before booking self-directed testing.</p>
        </aside>
      </div>
    </section>

    <section class="detail-section section-pad section-bg-soft">
      <div class="container">
        <div class="section-heading split">
          <div>
            <p class="overline">Why consider this test</p>
            <h2>Helpful for these situations</h2>
          </div>
        </div>
        <div class="reason-grid">
          ${test.reasons
            .map(
              ([title, copy]) => `
                <article class="reason-card">
                  <h3>${escapeHtml(title)}</h3>
                  <p>${escapeHtml(copy)}</p>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
    </section>

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
          <a class="button secondary" href="tests.html">Shop tests</a>
        </div>
        <div class="related-grid">
          ${test.related.map(buildRelatedCard).join("")}
        </div>
      </div>
    </section>

    <section class="detail-section section-pad section-bg-white">
      <div class="container faq-container">
        <p class="overline">FAQ</p>
        <h2>Common questions</h2>
        <div class="detail-faq-list">
          ${test.faqs
            .map(
              ([question, answer]) => `
                <details>
                  <summary>${escapeHtml(question)}</summary>
                  <p>${escapeHtml(answer)}</p>
                </details>
              `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function cartLineItems() {
  return readCart()
    .map((item) => ({ ...item, test: getTestBySlug(item.slug) }))
    .filter((item) => item.test);
}

function cartTotals(items) {
  return items.reduce(
    (totals, item) => {
      totals.subtotal += item.test.price * item.quantity;
      totals.original += item.test.oldPrice * item.quantity;
      return totals;
    },
    { subtotal: 0, original: 0 }
  );
}

function renderCartPage() {
  const container = document.querySelector("[data-cart-page]");
  if (!container || !TESTS.length) {
    return;
  }

  const items = cartLineItems();
  if (!items.length) {
    container.innerHTML = `
      <div class="empty-cart">
        <p class="eyebrow">Empty cart</p>
        <h2>Your cart is ready for tests.</h2>
        <p>Add one or more panels, then continue to booking for patient and collection details.</p>
        <div class="hero-actions">
          <a class="button primary" href="tests.html">Shop tests</a>
          <a class="button secondary" href="whatsapp.html">Book via WhatsApp</a>
        </div>
      </div>
    `;
    return;
  }

  const totals = cartTotals(items);
  const savings = Math.max(0, totals.original - totals.subtotal);
  const cartNames = items.map((item) => `${item.test.name} x ${item.quantity}`).join(", ");

  container.innerHTML = `
    <div class="cart-items" aria-label="Selected tests">
      ${items
        .map(
          ({ test, quantity }) => `
            <article class="cart-item">
              <a class="cart-item__image photo-thumb photo-thumb--${escapeHtml(test.imageTone || "blood")}" href="${detailUrl(test.slug)}">
                <img src="${escapeHtml(test.image)}" alt="" loading="lazy" decoding="async">
              </a>
              <div class="cart-item__body">
                <p class="overline">${escapeHtml(test.category)}</p>
                <h2><a href="${detailUrl(test.slug)}">${escapeHtml(test.name)}</a></h2>
                <p>${escapeHtml(test.summary)}</p>
                <ul class="test-meta">
                  <li>${escapeHtml(test.collection)}</li>
                  <li>${escapeHtml(test.results.replace(" after sample reaches the lab", ""))}</li>
                </ul>
              </div>
              <div class="cart-item__controls">
                <div class="price-row">
                  <span class="price">${formatPrice(test.price * quantity)}</span>
                  <span class="old-price">${formatPrice(test.oldPrice * quantity)}</span>
                </div>
                <div class="quantity-control" aria-label="Quantity for ${escapeHtml(test.name)}">
                  <button type="button" data-cart-action="decrease" data-cart-slug="${escapeHtml(test.slug)}" aria-label="Decrease ${escapeHtml(test.name)} quantity">-</button>
                  <span>${quantity}</span>
                  <button type="button" data-cart-action="increase" data-cart-slug="${escapeHtml(test.slug)}" aria-label="Increase ${escapeHtml(test.name)} quantity">+</button>
                </div>
                <button class="cart-remove" type="button" data-cart-action="remove" data-cart-slug="${escapeHtml(test.slug)}">Remove</button>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
    <aside class="cart-summary" aria-label="Cart summary">
      <h2>Order summary</h2>
      <dl>
        <div><dt>Tests</dt><dd>${items.reduce((sum, item) => sum + item.quantity, 0)}</dd></div>
        <div><dt>Subtotal</dt><dd>${formatPrice(totals.original)}</dd></div>
        <div><dt>Savings</dt><dd>-${formatPrice(savings)}</dd></div>
        <div class="cart-summary__total"><dt>Total</dt><dd>${formatPrice(totals.subtotal)}</dd></div>
      </dl>
      <a class="button primary full" href="book.html?cart=checkout">Continue to booking</a>
      <a class="button secondary full" href="whatsapp.html?message=${encodeURIComponent(`I want to book: ${cartNames}`)}">Book via WhatsApp</a>
      <button class="cart-clear-link" type="button" data-cart-action="clear">Clear cart</button>
      <ul class="cart-assurance">
        <li>No payment is taken until your slot is confirmed.</li>
        <li>Care team reviews address, timing, and preparation.</li>
        <li>You can switch to WhatsApp support anytime.</li>
      </ul>
    </aside>
  `;
}

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-to-cart]");
  if (addButton) {
    const slug = addButton.getAttribute("data-add-to-cart");
    const test = getTestBySlug(slug);
    if (test) {
      addToCart(slug);
      renderCartPage();
      showCartToast(`${test.name} added to cart.`);
    }
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

renderTestsCatalog();
renderTestDetailPage();
renderCartPage();
updateCartBadges();
