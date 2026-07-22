import type { CatalogBundle, MappedTest } from "./catalog";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatPrice(price: number): string {
  return `₹${Math.round(Number(price) || 0).toLocaleString("en-IN")}`;
}

function detailUrl(slug: string): string {
  return `/tests/${encodeURIComponent(slug)}`;
}

function formatOldPriceHtml(test: MappedTest, displayPrice: number): string {
  if (test.oldPrice && test.oldPrice > displayPrice) {
    return `<span class="old-price">${formatPrice(test.oldPrice)}</span>`;
  }
  return "";
}

export function buildCatalogCard(test: MappedTest): string {
  const filters = (test.filters || ["all"]).join(" ");
  const testCategories = Array.isArray(test.testCategories)
    ? test.testCategories.map(String)
    : [];
  const searchText = [
    test.name,
    test.category,
    test.summary,
    test.headline,
    ...(Array.isArray(test.markers) ? test.markers : []),
  ].join(" ");
  const badge = test.badge
    ? `<span class="test-badge test-badge--popular">${escapeHtml(test.badge)}</span>`
    : "";
  const displayPrice = Number(test.price) || 0;
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

function rewriteSiteLinks(html: string): string {
  let out = html
    .replaceAll('href="index.html"', 'href="/"')
    .replaceAll("href='index.html'", "href='/'")
    .replaceAll('href="tests.html"', 'href="/tests"')
    .replaceAll("href='tests.html'", "href='/tests'")
    .replaceAll('href="tests.html#', 'href="/tests#')
    .replaceAll('href="about.html"', 'href="/about"')
    .replaceAll('href="reports.html"', 'href="/reports"')
    .replaceAll('href="account.html"', 'href="/account"')
    .replaceAll('href="cart.html"', 'href="/cart"')
    .replaceAll('href="whatsapp.html"', 'href="/whatsapp"')
    .replaceAll('href="promotions.html"', 'href="/promotions"')
    .replaceAll('href="privacy.html"', 'href="/privacy"')
    .replaceAll('href="terms.html"', 'href="/terms"')
    .replaceAll('href="help.html"', 'href="/help"')
    .replaceAll('href="login.html"', 'href="/login"')
    .replaceAll('href="book.html"', 'href="/book"')
    .replaceAll('href="doctors.html"', 'href="/doctors"')
    .replaceAll('href="signup.html"', 'href="/signup"')
    .replaceAll('href="forgot-password.html"', 'href="/forgot-password"')
    .replaceAll('href="sample-report.html"', 'href="/sample-report"')
    .replaceAll('href="privacy-choices.html"', 'href="/privacy-choices"')
    .replaceAll('href="account.html"', 'href="/account"');
  // Root-absolute assets so /tests and /tests/:slug resolve correctly
  out = out
    .replaceAll('href="assets/', 'href="/assets/')
    .replaceAll("href='assets/", "href='/assets/")
    .replaceAll('src="assets/', 'src="/assets/')
    .replaceAll("src='assets/", "src='/assets/");
  // Offline demo catalog is unnecessary when SSR already injected live data.
  out = out.replace(
    /<script\s+src="\/assets\/js\/test-data\.js"><\/script>\s*/g,
    "",
  );
  if (!out.includes("<base ") && out.includes("</head>")) {
    out = out.replace("</head>", '<base href="/">\n</head>');
  }
  return out;
}

export function injectSsrBootstrap(html: string, catalog: CatalogBundle, extra?: Record<string, unknown>): string {
  const payload = {
    tests: catalog.tests,
    panels: catalog.panels,
    promotions: catalog.promotions,
    source: "ssr",
    ...extra,
  };
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  const script = `<script>
window.DRSWIFT_CATALOG_SOURCE="ssr";
window.__DRSWIFT_SSR__=${json};
window.DRSWIFT_TESTS=window.__DRSWIFT_SSR__.tests;
window.DRSWIFT_PANELS=window.__DRSWIFT_SSR__.panels||{};
window.DRSWIFT_PANEL_ORDER=Object.keys(window.DRSWIFT_PANELS);
window.DRSWIFT_PROMOTIONS=window.__DRSWIFT_SSR__.promotions||[];
</script>`;
  if (html.includes("</head>")) {
    return rewriteSiteLinks(html.replace("</head>", `${script}\n</head>`));
  }
  return rewriteSiteLinks(script + html);
}

export function injectCatalogGrid(html: string, tests: MappedTest[]): string {
  const cards = tests.map(buildCatalogCard).join("\n");
  const filled = `<div class="catalog-grid" id="catalog-grid" data-catalog-grid data-ssr="1">${cards}</div>`;
  return html.replace(
    /<div class="catalog-grid" id="catalog-grid" data-catalog-grid><\/div>/,
    filled,
  );
}

export function injectHomeFeatured(html: string, tests: MappedTest[]): string {
  const featured = tests.filter((t) => Boolean(t.frequentlyOrderedTest));
  const cards = featured.map(buildCatalogCard).join("\n");
  // Prefer explicit home featured rail when present
  if (html.includes("data-home-featured")) {
    return html.replace(
      /(<[^>]*data-home-featured[^>]*>)([\s\S]*?)(<\/[^>]+>)/i,
      `$1${cards}$3`,
    );
  }
  return html;
}

export function fallbackUnavailablePage(message?: string): string {
  const msg =
    message ||
    "We are temporarily unable to load the latest tests. Please try again shortly.";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Temporarily unavailable | Dr.Swift Diagnostics</title>
  <link rel="stylesheet" href="/assets/css/styles.css">
</head>
<body>
  <main class="container section-pad" style="max-width:40rem;margin:4rem auto;text-align:center">
    <h1>Dr.Swift Diagnostics</h1>
    <p>${escapeHtml(msg)}</p>
    <p><a class="button primary" href="/">Back home</a> · <a class="button secondary" href="/tests">Try tests again</a></p>
  </main>
</body>
</html>`;
}

export function securityHeaders(isHtml: boolean): Headers {
  const headers = new Headers();
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  if (isHtml) {
    headers.set(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://apis.google.com; worker-src 'self' blob:; connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com; frame-src 'self' https://accounts.google.com https://*.firebaseapp.com https://apis.google.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://accounts.google.com https://*.firebaseapp.com",
    );
    headers.set("Cache-Control", "public, max-age=300, s-maxage=3600");
  }
  return headers;
}
