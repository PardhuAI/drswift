import type { Env } from "./env";
import { assertHttpsOrigin, originBase } from "./env";
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

const FIREBASE_AUTH_ORIGIN = "https://drswift-platform.firebaseapp.com";

/**
 * Proxy Firebase Auth helper pages onto drswift.in so authDomain can be same-origin.
 * Avoids "missing initial state" under browser storage partitioning.
 * @see https://firebase.google.com/docs/auth/web/redirect-best-practices
 */
async function proxyFirebaseAuthHelper(request: Request, url: URL): Promise<Response> {
  const target = new URL(`${url.pathname}${url.search}`, FIREBASE_AUTH_ORIGIN);
  const headers = new Headers(request.headers);
  headers.set("Host", "drswift-platform.firebaseapp.com");
  headers.delete("cf-connecting-ip");
  headers.delete("cf-ray");
  headers.delete("cf-visitor");
  headers.delete("cf-ipcountry");
  headers.delete("x-forwarded-proto");
  headers.delete("x-real-ip");

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
    // @ts-expect-error Workers duplex streaming for request body
    init.duplex = "half";
  }

  const upstream = await fetch(target.toString(), init);
  const outHeaders = new Headers(upstream.headers);
  outHeaders.delete("content-security-policy");
  outHeaders.delete("content-security-policy-report-only");
  outHeaders.set("Cache-Control", "private, no-store");
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outHeaders,
  });
}

/** BFF: browser → Worker → SwiftCMS public API (Basic Auth stays on the Worker). */
async function proxyOriginPublicApi(request: Request, env: Env, pathname: string): Promise<Response> {
  assertHttpsOrigin(env);
  const target = `${originBase(env)}${pathname}`;
  const headers = new Headers();
  headers.set("Accept", "application/json");
  headers.set("Content-Type", request.headers.get("Content-Type") || "application/json");
  headers.set("X-DrSwift-Caller", "cloudflare-worker");
  headers.set("Cache-Control", "no-cache");
  const user = env.ORIGIN_BASIC_AUTH_USERNAME || "";
  const pass = env.ORIGIN_BASIC_AUTH_PASSWORD || "";
  if (user && pass) {
    headers.set("Authorization", `Basic ${btoa(`${user}:${pass}`)}`);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
    cf: { cacheTtl: 0, cacheEverything: false },
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  const upstream = await fetch(target, init);
  const contentType = upstream.headers.get("Content-Type") || "";
  const bodyText = await upstream.text();
  const outHeaders = new Headers();
  outHeaders.set("Cache-Control", "private, no-store");
  outHeaders.set("Content-Type", "application/json; charset=utf-8");

  if (!contentType.includes("application/json")) {
    const message =
      upstream.status === 404
        ? "Checkout API is not deployed on the server yet."
        : "Checkout API returned an unexpected response.";
    return new Response(JSON.stringify({ ok: false, message }), {
      status: upstream.status === 404 ? 502 : upstream.status || 502,
      headers: outHeaders,
    });
  }

  return new Response(bodyText, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outHeaders,
  });
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

    // Firebase Auth helpers (same-origin authDomain)
    if (pathname === "/__/firebase/init.json" || pathname.startsWith("/__/auth")) {
      return proxyFirebaseAuthHelper(request, url);
    }

    // Checkout BFF (orders + payments) → SwiftCMS with Worker Basic Auth.
    // Use /_drswift/* so custom-domain /api/* routes to CMS do not bypass this Worker.
    if (
      pathname === "/_drswift/checkout" ||
      pathname.startsWith("/_drswift/checkout/") ||
      pathname === "/api/v1/public/checkout" ||
      pathname.startsWith("/api/v1/public/checkout/")
    ) {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": url.origin,
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",
          },
        });
      }
      if (request.method !== "POST" && request.method !== "GET") {
        return new Response(JSON.stringify({ ok: false, message: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
        });
      }
      // Payment status polling is GET; order/payment creation is POST.
      if (request.method === "GET" && !/\/payments\/[^/]+\/?$/.test(pathname)) {
        return new Response(JSON.stringify({ ok: false, message: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
        });
      }
      const originPath = pathname.startsWith("/_drswift/checkout")
        ? pathname.replace("/_drswift/checkout", "/api/v1/public/checkout")
        : pathname;
      try {
        return await proxyOriginPublicApi(request, env, originPath);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Checkout API unavailable";
        console.error("Checkout BFF failure:", message);
        return new Response(JSON.stringify({ ok: false, message: "Checkout is temporarily unavailable." }), {
          status: 502,
          headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
        });
      }
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
      "/policies": "/policies.html",
      "/help": "/help.html",
      "/login": "/login.html",
      "/book": "/book.html",
      "/doctors": "/doctors.html",
      "/signup": "/signup.html",
      "/forgot-password": "/forgot-password.html",
      "/sample-report": "/sample-report.html",
      "/privacy-choices": "/privacy-choices.html",
      "/account": "/account.html",
    };

    if (staticHtmlPages[pathname]) {
      // Promotions benefits from catalog SSR for promo cards
      if (pathname === "/promotions") {
        return withCatalog(env, async (catalog) => {
          const template = (await readAsset(env, "/promotions.html")) || fallbackUnavailablePage();
          return injectSsrBootstrap(template, catalog);
        });
      }
      let template = await readAsset(env, staticHtmlPages[pathname]!);
      // Some newly uploaded HTML assets resolve via request-origin fetch more reliably than assets.local
      if (!template) {
        const assetUrl = new URL(staticHtmlPages[pathname]!, url.origin);
        const assetRes = await env.ASSETS.fetch(new Request(assetUrl.toString()));
        if (assetRes.ok) template = await assetRes.text();
      }
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
