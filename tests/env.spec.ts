import { describe, expect, it } from "vitest";
import { assertHttpsOrigin, type Env } from "../src/env";

function env(partial: Partial<Env>): Env {
  return {
    ASSETS: {} as Fetcher,
    ORIGIN_API_BASE_URL: "https://test-admin.drswift.in",
    ORIGIN_BASIC_AUTH_USERNAME: "u",
    ORIGIN_BASIC_AUTH_PASSWORD: "p",
    PUBLIC_SITE_URL: "https://drswift.in",
    ENVIRONMENT: "production",
    CATALOG_CACHE_TTL_SECONDS: "600",
    ...partial,
  };
}

describe("ORIGIN_API_BASE_URL validation", () => {
  it("allows https production URLs", () => {
    expect(() => assertHttpsOrigin(env({}))).not.toThrow();
  });

  it("allows http localhost for development", () => {
    expect(() =>
      assertHttpsOrigin(env({ ORIGIN_API_BASE_URL: "http://localhost:8081", ENVIRONMENT: "development" })),
    ).not.toThrow();
  });

  it("rejects plain http for non-local hosts", () => {
    expect(() =>
      assertHttpsOrigin(env({ ORIGIN_API_BASE_URL: "http://test-admin.drswift.in" })),
    ).toThrow(/HTTPS/);
  });
});
