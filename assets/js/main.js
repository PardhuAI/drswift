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

function restartFeatureAnimations() {
  restartGraphLineAnimation();
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
