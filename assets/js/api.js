/**
 * CMS catalog client for New_Dr_Swift_Website.
 * Fetches Live tests + promotions from DrSwift-CMS and maps them into
 * window.DRSWIFT_TESTS / DRSWIFT_PANELS / DRSWIFT_PROMOTIONS.
 * Static test-data.js remains offline fallback only when CMS is unreachable.
 */
(function (global) {
  const API_BASE = String(global.DRSWIFT_API_BASE || "").replace(/\/$/, "");
  const FETCH_OPTS = { headers: { Accept: "application/json" }, cache: "no-store" };

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function effectivePrice(testLike) {
    const price = Number(testLike?.price);
    if (Number.isFinite(price)) {
      return price;
    }
    const cents = Number(testLike?.priceCents);
    if (Number.isFinite(cents)) {
      return Math.round(cents / 100);
    }
    return 0;
  }

  function normalizeMarkers(markers) {
    return asArray(markers).map((marker) => {
      if (typeof marker === "string") {
        return { name: marker, description: "" };
      }
      return {
        name: marker?.name || String(marker || ""),
        description: marker?.description || ""
      };
    });
  }

  function toneFromCategory(category) {
    const key = String(category || "").toLowerCase();
    if (key.includes("heart") || key.includes("lipid")) return "heart";
    if (key.includes("thyroid")) return "thyroid";
    if (key.includes("women")) return "women";
    if (key.includes("men")) return "body";
    if (key.includes("full") || key.includes("body")) return "body";
    if (key.includes("urine") || key.includes("fever") || key.includes("infection")) return "urine";
    return "blood";
  }

  /** Top-level CMS fields, or nested attributesJson duplicates. */
  function attrString(apiTest, keys, fallback) {
    function tryValue(value) {
      if (typeof value === "string" && value.trim()) return value.trim();
      if (Array.isArray(value) && value.length) {
        const first = String(value[0] || "").trim();
        return first || null;
      }
      return null;
    }
    for (const key of keys) {
      const top = tryValue(apiTest?.[key]);
      if (top) return top;
    }
    let attrs = apiTest?.attributesJson;
    if (typeof attrs === "string") {
      try {
        attrs = JSON.parse(attrs);
      } catch {
        attrs = null;
      }
    }
    if (attrs && typeof attrs === "object" && !Array.isArray(attrs)) {
      for (const key of keys) {
        const nested = tryValue(attrs[key]);
        if (nested) return nested;
      }
    }
    return fallback;
  }

  /** Exact CMS testCategories from top-level or attributesJson. */
  function extractTestCategories(apiTest) {
    const fromTop = asArray(apiTest?.testCategories).map(String).filter(Boolean);
    if (fromTop.length) {
      return fromTop;
    }
    let attrs = apiTest?.attributesJson;
    if (typeof attrs === "string") {
      try {
        attrs = JSON.parse(attrs);
      } catch {
        attrs = null;
      }
    }
    if (attrs && typeof attrs === "object" && !Array.isArray(attrs)) {
      return asArray(attrs.testCategories).map(String).filter(Boolean);
    }
    return [];
  }

  /** Ensure toolbar chips (kidney / cbc / fever / vitamins) match even when CMS categories are broader. */
  function enrichFilters(apiTest, existing) {
    const filters = new Set(asArray(existing).map(String).filter(Boolean));
    filters.add("all");
    const blob = [
      apiTest?.name,
      apiTest?.slug,
      apiTest?.category,
      apiTest?.summary,
      apiTest?.shortDescription,
      apiTest?.alternativeNames,
      ...(asArray(apiTest?.filters)),
    ]
      .join(" ")
      .toLowerCase();
    if (/kidney|creatinine|egfr|\bkft\b|renal/.test(blob)) filters.add("kidney");
    if (/\bcbc\b|complete blood|hemogram|blood count/.test(blob)) filters.add("cbc");
    if (/fever|dengue|malaria|typhoid|widal|\bns1\b/.test(blob)) filters.add("fever");
    if (/vitamin|vit\.?\s*d|vit\.?\s*b|\bb12\b|25-oh/.test(blob)) filters.add("vitamins");
    return Array.from(filters);
  }

  function mapFaqs(faqs) {
    return asArray(faqs).map((faq) => {
      if (Array.isArray(faq)) {
        return [faq[0] || "", faq[1] || ""];
      }
      return [faq?.question || "", faq?.answer || ""];
    });
  }

  function mapReasons(reasons) {
    return asArray(reasons).map((reason) => {
      if (Array.isArray(reason)) {
        return [reason[0] || "", reason[1] || ""];
      }
      return [reason?.title || "", reason?.copy || ""];
    });
  }

  function mapRelated(related) {
    return asArray(related)
      .map((item) => (typeof item === "string" ? item : item?.slug))
      .filter(Boolean);
  }

  function registerPanelsFromWhatsTested(whatsTested, panels) {
    const panelIds = [];
    asArray(whatsTested).forEach((group) => {
      const id = String(group?.slug || group?.id || "").trim();
      if (!id) {
        return;
      }
      panelIds.push(id);
      panels[id] = {
        id,
        title: group.title || id,
        testCode: group.testCode || "",
        price: Number(group.price || 0),
        description: group.description || "",
        markers: normalizeMarkers(group.markers)
      };
    });
    return panelIds;
  }

  function mapApiTest(apiTest, panels) {
    const whatsTestedRaw = asArray(apiTest.whatsTested);
    const isProfile = String(apiTest.testType || "").toLowerCase() === "profile";
    const customizable = Boolean(apiTest.customizable);
    const panelIds = registerPanelsFromWhatsTested(whatsTestedRaw, panels);
    const price = effectivePrice(apiTest);
    const oldPriceRaw = apiTest.oldPrice != null ? Number(apiTest.oldPrice) : NaN;
    const oldPrice = Number.isFinite(oldPriceRaw) && oldPriceRaw > price ? oldPriceRaw : undefined;

    const mapped = {
      id: apiTest.id,
      slug: apiTest.slug,
      name: apiTest.name || "",
      shortName: apiTest.name || "",
      category: apiTest.category || "General",
      eyebrow: String(apiTest.eyebrow || "").trim(),
      filters: enrichFilters(apiTest, asArray(apiTest.filters).length ? asArray(apiTest.filters) : ["all"]),
      image: apiTest.imageUrl || apiTest.image || "",
      imageTone: toneFromCategory(apiTest.category),
      badge: apiTest.badge || (customizable ? "Customizable" : ""),
      price,
      oldPrice,
      summary: apiTest.summary || apiTest.shortDescription || "",
      headline: apiTest.headline || apiTest.summary || apiTest.shortDescription || "",
      description: apiTest.description || apiTest.longDescription || apiTest.shortDescription || "",
      sampleType: attrString(apiTest, ["sampleType"], "Blood"),
      collection: attrString(apiTest, ["collection"], "At-home sample collection"),
      age: attrString(apiTest, ["age", "ageRange"], "18+ recommended"),
      results: attrString(
        apiTest,
        ["results", "resultsTimeline"],
        "24-48 hours after sample reaches the lab"
      ),
      preparation: attrString(apiTest, ["preparation", "preparationText"], ""),
      hsa: attrString(apiTest, ["hsa"], "Accepted"),
      // Public site always shows Online booking.
      purchaser: "Online",
      customizable,
      testType: apiTest.testType || "Test",
      frequentlyOrderedTest: Boolean(
        apiTest.frequentlyOrderedTest ??
          (apiTest.attributesJson &&
            typeof apiTest.attributesJson === "object" &&
            apiTest.attributesJson.frequentlyOrderedTest)
      ),
      testCategories: extractTestCategories(apiTest),
      markers: whatsTestedRaw.flatMap((group) =>
        normalizeMarkers(group.markers).map((marker) => marker.name).filter(Boolean)
      ),
      whatsTested: whatsTestedRaw.map((group) => ({
        id: group.id || group.slug,
        title: group.title || "",
        description: group.description || "",
        price: Number(group.price || 0),
        markers: normalizeMarkers(group.markers)
      })),
      reasons: mapReasons(apiTest.reasons),
      related: mapRelated(apiTest.related),
      faqs: mapFaqs(apiTest.faqs)
    };

    if (customizable && panelIds.length) {
      mapped.basePanelIds = panelIds;
      mapped.optionalPanelIds = [];
    } else if (isProfile && panelIds.length) {
      mapped.panelIds = panelIds;
    }

    if (mapped.slug === "custom-men-s-health-test") {
      mapped.compareWith = "men-s-health-test";
    } else if (mapped.slug === "men-s-health-test") {
      mapped.compareWith = "custom-men-s-health-test";
    } else if (mapped.slug === "custom-women-s-health-test") {
      mapped.compareWith = "women-s-health-test";
    } else if (mapped.slug === "women-s-health-test") {
      mapped.compareWith = "custom-women-s-health-test";
    }

    return mapped;
  }

  function mapPromotion(promo) {
    const originalCents = Number(promo?.originalPriceCents);
    const saleCents = Number(promo?.salePriceCents);
    const original = Number.isFinite(originalCents) ? Math.round(originalCents / 100) : undefined;
    const sale = Number.isFinite(saleCents) ? Math.round(saleCents / 100) : undefined;
    const price = sale ?? original ?? 0;
    const oldPrice = original != null && sale != null && original > sale ? original : undefined;
    let discountLabel = promo?.tag || "Offer";
    if (oldPrice && price) {
      const pct = Math.round(((oldPrice - price) / oldPrice) * 100);
      if (pct > 0) {
        discountLabel = `${pct}% off`;
      }
    }
    return {
      id: promo?.id,
      title: promo?.title || "",
      subtitle: promo?.subtitle || "",
      imageUrl: promo?.imageUrl || "",
      slug: promo?.linkSlug || "",
      dateRange: promo?.dateRange || "",
      price,
      oldPrice,
      badge: discountLabel,
      currency: promo?.currency || "INR"
    };
  }

  async function fetchCatalog() {
    if (!API_BASE) {
      throw new Error("Browser catalog API is disabled; use SSR bootstrap");
    }
    const response = await fetch(`${API_BASE}/api/v1/public/catalog`, FETCH_OPTS);
    if (!response.ok) {
      throw new Error(`Catalog request failed (${response.status})`);
    }
    return response.json();
  }

  async function fetchTestBySlug(slug) {
    if (!API_BASE) {
      throw new Error("Browser catalog API is disabled; use SSR bootstrap");
    }
    const response = await fetch(
      `${API_BASE}/api/v1/public/catalog/tests/${encodeURIComponent(slug)}`,
      FETCH_OPTS
    );
    if (!response.ok) {
      throw new Error(`Test detail request failed (${response.status})`);
    }
    return response.json();
  }

  async function bootstrapCatalogFromCms() {
    const payload = await fetchCatalog();
    const panels = {};
    const tests = asArray(payload.tests).map((test) => mapApiTest(test, panels));
    if (!tests.length) {
      throw new Error("CMS catalog returned no Live tests");
    }
    global.DRSWIFT_TESTS = tests;
    global.DRSWIFT_PANELS = panels;
    global.DRSWIFT_PANEL_ORDER = Object.keys(panels);
    global.DRSWIFT_PROMOTIONS = asArray(payload.promotions).map(mapPromotion);
    global.DRSWIFT_CATALOG_SOURCE = "cms";
    return { tests, panels, promotions: global.DRSWIFT_PROMOTIONS };
  }

  function showCatalogSourceBanner(source) {
    // Catalog source is useful for diagnostics, but should never be patient-facing.
    document.querySelectorAll("[data-catalog-source-banner]").forEach((el) => el.remove());
  }

  function useSsrCatalogIfPresent() {
    const ssr = global.__DRSWIFT_SSR__;
    if (ssr && Array.isArray(ssr.tests) && ssr.tests.length) {
      global.DRSWIFT_TESTS = ssr.tests;
      global.DRSWIFT_PANELS = ssr.panels || {};
      global.DRSWIFT_PANEL_ORDER = Object.keys(global.DRSWIFT_PANELS);
      global.DRSWIFT_PROMOTIONS = ssr.promotions || [];
      global.DRSWIFT_CATALOG_SOURCE = "ssr";
      return {
        tests: global.DRSWIFT_TESTS,
        panels: global.DRSWIFT_PANELS,
        promotions: global.DRSWIFT_PROMOTIONS,
      };
    }
    if (global.DRSWIFT_CATALOG_SOURCE === "ssr" && Array.isArray(global.DRSWIFT_TESTS) && global.DRSWIFT_TESTS.length) {
      return {
        tests: global.DRSWIFT_TESTS,
        panels: global.DRSWIFT_PANELS || {},
        promotions: global.DRSWIFT_PROMOTIONS || [],
      };
    }
    return null;
  }

  global.DRSWIFT_API = {
    API_BASE,
    fetchCatalog,
    fetchTestBySlug,
    bootstrapCatalogFromCms,
    mapApiTest
  };

  global.DRSWIFT_BOOTSTRAP_CATALOG = async function bootstrapCatalog() {
    // Prefer Worker SSR payload — do not call the protected origin from the browser.
    const ssrCatalog = useSsrCatalogIfPresent();
    if (ssrCatalog) {
      showCatalogSourceBanner("ssr");
      return ssrCatalog;
    }
    if (!API_BASE) {
      // Browser must not hit the origin API; keep any static demo already loaded.
      global.DRSWIFT_CATALOG_SOURCE = global.DRSWIFT_CATALOG_SOURCE || "static-fallback";
      if (!Array.isArray(global.DRSWIFT_PROMOTIONS)) {
        global.DRSWIFT_PROMOTIONS = [];
      }
      showCatalogSourceBanner("static-fallback");
      return {
        tests: global.DRSWIFT_TESTS || [],
        panels: global.DRSWIFT_PANELS || {},
        promotions: global.DRSWIFT_PROMOTIONS || [],
      };
    }
    try {
      await bootstrapCatalogFromCms();
      showCatalogSourceBanner("cms");
    } catch (error) {
      console.warn("[DrSwift] CMS catalog unavailable — using static fallback.", error);
      global.DRSWIFT_CATALOG_SOURCE = "static-fallback";
      if (!Array.isArray(global.DRSWIFT_PROMOTIONS)) {
        global.DRSWIFT_PROMOTIONS = [];
      }
      showCatalogSourceBanner("static-fallback");
    }
  };
})(window);
