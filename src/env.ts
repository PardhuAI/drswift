export interface Env {
  ASSETS: Fetcher;
  ORIGIN_API_BASE_URL: string;
  ORIGIN_BASIC_AUTH_USERNAME: string;
  ORIGIN_BASIC_AUTH_PASSWORD: string;
  PUBLIC_SITE_URL: string;
  ENVIRONMENT: string;
  CATALOG_CACHE_TTL_SECONDS: string;
}

export function assertHttpsOrigin(env: Env): void {
  const base = (env.ORIGIN_API_BASE_URL || "").trim();
  if (!base) {
    throw new Error("ORIGIN_API_BASE_URL is required");
  }
  const url = new URL(base);
  const isLocal =
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "[::1]" ||
    url.hostname === "::1";
  if (url.protocol === "http:" && !isLocal) {
    throw new Error("Production API URL must use HTTPS");
  }
  if (url.protocol !== "https:" && !(url.protocol === "http:" && isLocal)) {
    throw new Error("ORIGIN_API_BASE_URL must be https:// (or http://localhost for development)");
  }
}

export function originBase(env: Env): string {
  assertHttpsOrigin(env);
  return env.ORIGIN_API_BASE_URL.replace(/\/$/, "");
}

export function catalogCacheTtlSeconds(env: Env): number {
  const n = Number.parseInt(env.CATALOG_CACHE_TTL_SECONDS || "600", 10);
  return Number.isFinite(n) && n > 0 ? n : 600;
}
