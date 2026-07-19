import type { Env } from "./env";
import { assertHttpsOrigin } from "./env";
import { loadCatalog, type CatalogBundle } from "./catalog";
import {
  fallbackUnavailablePage,
  injectCatalogGrid,
  injectHomeFeatured,
  injectSsrBootstrap,
  securityHeaders,
} from "./render";

const HTML_CACHE = "public, max-age=300, s-maxage=3600";
const PRIVATE_NO_STORE = "private, no-store";

async function readAsset(env: Env, path: string): Promise<string | null> {
  const url = new URL(path, "https://assets.local");
  const res = await env.ASSETS.fetch(new Request(url.toString()));
  if (!res.ok) return null;
  return res.text();
}

function htmlResponse(body: string, status = 200, cacheControl = HTML_CACHE): Response {
  const headers = securityHeaders(true);
  headers.set("Content-Type", "text/html; charset=utf-8");
  headers.set("Cache-Control", cacheControl);
  return new Response(body, { status, headers });
}

async function withCatalog(
  env: Env,
  render: (catalog: CatalogBundle) => Promise<string> | string,
): Promise<Response> {
  try {
    assertHttpsOrigin(env);
    const catalog = await loadCatalog(env);
    if (!catalog.tests.length) {
      return htmlResponse(fallbackUnavailablePage(), 503, PRIVATE_NO_STORE);
    }
    const html = await render(catalog);
    return htmlResponse(html);
  } catch (err) {
    const message = err instanceof Error ? err.message : "catalog error";
    console.error("SSR catalog failure:", message);
    return htmlResponse(fallbackUnavailablePage(), 503, PRIVATE_NO_STORE);
  }
}

function canonicalizeWww(request: Request, env: Env): Response | null {
  const url = new URL(request.url);
  if (url.hostname === "www.drswift.in") {
    const target = new URL(request.url);
    target.hostname = "drswift.in";
    return Response.redirect(target.toString(), 301);
  }
  if (env.ENVIRONMENT === "production" && url.protocol === "http:") {
    url.protocol = "https:";
    return Response.redirect(url.toString(), 301);
  }
  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const redirected = canonicalizeWww(request, env);
    if (redirected) return redirected;

    const url = new URL(request.url);
    let pathname = url.pathname;
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }

    // Clean URL aliases
    if (pathname === "/index.html") {
      return Response.redirect(new URL("/", url).toString(), 301);
    }
    if (pathname === "/tests.html") {
      return Response.redirect(new URL("/tests", url).toString(), 301);
    }
    if (pathname === "/test-details.html") {
      const slug =
        url.searchParams.get("test") ||
        url.searchParams.get("slug") ||
        "";
      if (slug) {
        return Response.redirect(new URL(`/tests/${encodeURIComponent(slug)}`, url).toString(), 301);
      }
      return Response.redirect(new URL("/tests", url).toString(), 302);
    }

    // Home SSR
    if (pathname === "/" || pathname === "") {
      return withCatalog(env, async (catalog) => {
        const template = (await readAsset(env, "/index.html")) || fallbackUnavailablePage();
        let html = injectSsrBootstrap(template, catalog);
        html = injectHomeFeatured(html, catalog.tests);
        return html;
      });
    }

    // Tests catalog SSR
    if (pathname === "/tests") {
      return withCatalog(env, async (catalog) => {
        const template = (await readAsset(env, "/tests.html")) || fallbackUnavailablePage();
        let html = injectCatalogGrid(template, catalog.tests);
        html = injectSsrBootstrap(html, catalog);
        return html;
      });
    }

    // Test detail SSR
    const testMatch = /^\/tests\/([^/]+)$/.exec(pathname);
    if (testMatch) {
      const slug = decodeURIComponent(testMatch[1]!);
      return withCatalog(env, async (catalog) => {
        const test = catalog.tests.find((t) => t.slug === slug);
        const template = (await readAsset(env, "/test-details.html")) || fallbackUnavailablePage();
        let html = injectSsrBootstrap(template, catalog, { detailSlug: slug });
        if (test) {
          html = html.replace(
            /<title>[^<]*<\/title>/,
            `<title>${test.name.replace(/</g, "")} | Dr.Swift Diagnostics</title>`,
          );
        }
        return html;
      });
    }

    // Other HTML pages: serve via assets with link rewriting + light cache
    const staticHtmlPages: Record<string, string> = {
      "/about": "/about.html",
      "/reports": "/reports.html",
      "/cart": "/cart.html",
      "/whatsapp": "/whatsapp.html",
      "/promotions": "/promotions.html",
      "/privacy": "/privacy.html",
      "/terms": "/terms.html",
      "/help": "/help.html",
      "/login": "/login.html",
      "/book": "/book.html",
      "/doctors": "/doctors.html",
      "/signup": "/signup.html",
      "/forgot-password": "/forgot-password.html",
      "/sample-report": "/sample-report.html",
      "/privacy-choices": "/privacy-choices.html",
    };

    if (staticHtmlPages[pathname]) {
      // Promotions benefits from catalog SSR for promo cards
      if (pathname === "/promotions") {
        return withCatalog(env, async (catalog) => {
          const template = (await readAsset(env, "/promotions.html")) || fallbackUnavailablePage();
          return injectSsrBootstrap(template, catalog);
        });
      }
      const template = await readAsset(env, staticHtmlPages[pathname]!);
      if (!template) {
        return htmlResponse(fallbackUnavailablePage("Page not found."), 404, PRIVATE_NO_STORE);
      }
      // Still bootstrap empty/fallback so client scripts don't hit origin API
      try {
        const catalog = await loadCatalog(env);
        return htmlResponse(injectSsrBootstrap(template, catalog));
      } catch {
        return htmlResponse(
          injectSsrBootstrap(template, { tests: [], panels: {}, promotions: [], raw: { tests: [], promotions: [] } }),
        );
      }
    }

    // Static assets
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status === 404) {
      return htmlResponse(fallbackUnavailablePage("Page not found."), 404, PRIVATE_NO_STORE);
    }

    const headers = new Headers(assetResponse.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    const path = pathname.toLowerCase();
    if (path.match(/\.(css|js|svg|png|jpg|jpeg|webp|woff2?)$/)) {
      if (path.includes("?v=") || request.url.includes("?v=")) {
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
      } else {
        headers.set("Cache-Control", "public, max-age=86400");
      }
    }
    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers,
    });
  },
};
