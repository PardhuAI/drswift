import type { Env } from "./env";
import { catalogCacheTtlSeconds, originBase } from "./env";

export interface CatalogPayload {
  tests: unknown[];
  promotions: unknown[];
  featuredCollections?: unknown[];
}

export interface MappedTest {
  id?: string;
  slug: string;
  name: string;
  category: string;
  filters: string[];
  image: string;
  imageTone: string;
  badge: string;
  price: number;
  oldPrice?: number;
  summary: string;
  headline?: string;
  markers?: unknown[];
  reasons?: unknown[];
  [key: string]: unknown;
}

export interface CatalogBundle {
  tests: MappedTest[];
  panels: Record<string, unknown>;
  promotions: unknown[];
  raw: CatalogPayload;
}

const CATALOG_CACHE_KEY = "https://catalog-cache.drswift.internal/v1/catalog";

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function effectivePrice(testLike: Record<string, unknown>): number {
  const price = Number(testLike?.price);
  if (Number.isFinite(price)) return price;
  const cents = Number(testLike?.priceCents);
  if (Number.isFinite(cents)) return Math.round(cents / 100);
  return 0;
}

function toneFromCategory(category: string): string {
  const key = String(category || "").toLowerCase();
  if (key.includes("heart") || key.includes("lipid")) return "heart";
  if (key.includes("thyroid")) return "thyroid";
  if (key.includes("women")) return "women";
  if (key.includes("men")) return "body";
  if (key.includes("full") || key.includes("body")) return "body";
  if (key.includes("urine") || key.includes("fever") || key.includes("infection")) return "urine";
  return "blood";
}

function mapApiTest(apiTest: Record<string, unknown>, panels: Record<string, unknown>): MappedTest {
  const whatsTested = asArray<Record<string, unknown>>(apiTest.whatsTested);
  const customizable = Boolean(apiTest.customizable);
  for (const group of whatsTested) {
    const id = String(group?.slug || group?.id || "").trim();
    if (!id) continue;
    panels[id] = {
      id,
      title: group.title || id,
      testCode: group.testCode || "",
      price: Number(group.price || 0),
      description: group.description || "",
      markers: asArray(group.markers),
    };
  }
  const price = effectivePrice(apiTest);
  const oldPriceRaw = apiTest.oldPrice != null ? Number(apiTest.oldPrice) : NaN;
  const oldPrice = Number.isFinite(oldPriceRaw) && oldPriceRaw > price ? oldPriceRaw : undefined;
  return {
    id: String(apiTest.id ?? ""),
    slug: String(apiTest.slug || ""),
    name: String(apiTest.name || ""),
    category: String(apiTest.category || "General"),
    filters: asArray<string>(apiTest.filters).length ? asArray<string>(apiTest.filters) : ["all"],
    image: String(apiTest.imageUrl || apiTest.image || ""),
    imageTone: toneFromCategory(String(apiTest.category || "")),
    badge: String(apiTest.badge || (customizable ? "Customizable" : "")),
    price,
    oldPrice,
    summary: String(apiTest.summary || apiTest.shortDescription || ""),
    headline: String(apiTest.headline || apiTest.summary || ""),
    markers: asArray(apiTest.markers),
    reasons: asArray(apiTest.reasons),
    customizable,
    testType: apiTest.testType,
    sampleType: apiTest.sampleType || "Blood",
    collection: apiTest.collection || "At-home sample collection",
    description: apiTest.description || apiTest.longDescription || "",
    whatsTested,
    faqs: asArray(apiTest.faqs),
    related: asArray(apiTest.related),
  };
}

function mapPromotion(promo: Record<string, unknown>) {
  const originalCents = Number(promo?.originalPriceCents);
  const saleCents = Number(promo?.salePriceCents);
  const original = Number.isFinite(originalCents) ? Math.round(originalCents / 100) : undefined;
  const sale = Number.isFinite(saleCents) ? Math.round(saleCents / 100) : undefined;
  const price = sale ?? original ?? 0;
  const oldPrice = original != null && sale != null && original > sale ? original : undefined;
  let discountLabel = String(promo?.tag || "Offer");
  if (oldPrice && price) {
    const pct = Math.round(((oldPrice - price) / oldPrice) * 100);
    if (pct > 0) discountLabel = `${pct}% off`;
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
    currency: promo?.currency || "INR",
  };
}

function basicAuthHeader(env: Env): string {
  const user = env.ORIGIN_BASIC_AUTH_USERNAME || "";
  const pass = env.ORIGIN_BASIC_AUTH_PASSWORD || "";
  const token = btoa(`${user}:${pass}`);
  return `Basic ${token}`;
}

async function fetchCatalogFromOrigin(env: Env): Promise<CatalogPayload> {
  const url = `${originBase(env)}/api/v1/public/catalog`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-DrSwift-Caller": "cloudflare-worker",
      // Prevent zone "cache everything" from storing this authenticated response
      // for anonymous replay (no Vary: Authorization on the cached object).
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    };
    const user = env.ORIGIN_BASIC_AUTH_USERNAME || "";
    const pass = env.ORIGIN_BASIC_AUTH_PASSWORD || "";
    if (user && pass) {
      headers.Authorization = basicAuthHeader(env);
    }
    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
      redirect: "manual",
      // Do not write this origin response into the Cloudflare HTTP cache.
      cf: {
        cacheTtl: 0,
        cacheEverything: false,
      },
    });
    if (!response.ok) {
      throw new Error(`Catalog upstream status ${response.status}`);
    }
    const json = (await response.json()) as CatalogPayload;
    if (!Array.isArray(json.tests)) {
      throw new Error("Invalid catalog payload");
    }
    return json;
  } finally {
    clearTimeout(timer);
  }
}

export function mapCatalog(raw: CatalogPayload): CatalogBundle {
  const panels: Record<string, unknown> = {};
  const tests = asArray<Record<string, unknown>>(raw.tests).map((t) => mapApiTest(t, panels));
  const promotions = asArray<Record<string, unknown>>(raw.promotions).map(mapPromotion);
  return { tests, panels, promotions, raw };
}

export async function loadCatalog(env: Env): Promise<CatalogBundle> {
  const cache = caches.default;
  const cacheReq = new Request(CATALOG_CACHE_KEY);
  const cached = await cache.match(cacheReq);
  if (cached) {
    try {
      const raw = (await cached.json()) as CatalogPayload;
      return mapCatalog(raw);
    } catch {
      // fall through to refresh
    }
  }

  const raw = await fetchCatalogFromOrigin(env);
  const ttl = catalogCacheTtlSeconds(env);
  const toCache = new Response(JSON.stringify(raw), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${ttl}`,
    },
  });
  await cache.put(cacheReq, toCache.clone());
  return mapCatalog(raw);
}

export { CATALOG_CACHE_KEY };
