# Dr.Swift public site — Cloudflare Worker SSR

## Architecture

```
Browser → https://drswift.in (Worker SSR + static assets)
                ↓ HTTPS + Basic Auth + X-DrSwift-Caller
         https://test-admin.drswift.in/api/v1/public/catalog
                ↓
         SwiftCMS (ROLE_CLOUDFLARE_PUBLIC_SITE | ROLE_API | ROLE_ADMIN)
```

The browser receives fully rendered HTML for `/`, `/tests`, `/tests/:slug`, and `/promotions`
(with SSR bootstrap JSON). The browser does **not** call the catalog origin API
(`assets/js/api.js` prefers `window.__DRSWIFT_SSR__`).

Canonical host: `https://drswift.in` (`www` → 301).

## Worker secrets

```bash
wrangler secret put ORIGIN_BASIC_AUTH_USERNAME
wrangler secret put ORIGIN_BASIC_AUTH_PASSWORD
```

## Vars (`wrangler.jsonc`)

- `ORIGIN_API_BASE_URL` — must be `https://…` in production (localhost `http://` allowed in dev)
- `PUBLIC_SITE_URL` — `https://drswift.in`
- `ENVIRONMENT` — `production`
- `CATALOG_CACHE_TTL_SECONDS` — default `600` (Worker Cache API)

## CMS env (GitHub Environment secrets)

```
CLOUDFLARE_SITE_USERNAME=drswift-cf-site
CLOUDFLARE_SITE_PASSWORD=<long random>
```

Creates `ROLE_CLOUDFLARE_PUBLIC_SITE` (catalog only; not admin).

Local CMS development: `APP_SECURITY_DEV_MODE=true` (permitAll) via `application-local.properties`.

## Cache

| Layer | Policy |
|-------|--------|
| Public HTML (`drswift.in`) | `Cache-Control: public, max-age=300, s-maxage=3600` |
| Catalog JSON (Worker Cache API) | ~10 minutes; key `https://catalog-cache.drswift.internal/v1/catalog` |
| Origin `/api/v1/public/**` | `private, no-store` + `Vary: Authorization` (do not CDN-share) |
| Versioned static assets | `max-age=31536000, immutable` when `?v=` present |

### Purge after catalog updates (prefer prefixes / URLs, not purge_everything)

- `https://drswift.in/`
- `https://drswift.in/tests`
- `https://drswift.in/tests/*` (or listed detail URLs)
- `https://drswift.in/promotions`
- Worker catalog cache is TTL-based; redeploy or wait TTL after origin changes

CMS Settings → Cloudflare also supports zone purge / public-prefix purge for `test-admin` API host.

## Security notes

- Never put origin Basic Auth in HTML/JS.
- Do not edge-cache authenticated origin catalog under a zone-wide `cacheEverything` rule
  without `private, no-store` (anonymous HIT risk).
- Production Worker rejects non-HTTPS `ORIGIN_API_BASE_URL`.

## Local

```bash
cp .dev.vars.example .dev.vars
npm install
npm run dev
npm test
```

## Rollback

```bash
# Point domains away or redeploy a previous Worker version in the Cloudflare dashboard
npx wrangler deployments list
npx wrangler rollback
```
