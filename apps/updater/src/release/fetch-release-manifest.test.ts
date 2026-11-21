// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { HttpFetch } from "../types.js";
import { ReleaseSourceError } from "./errors/release-source-error.js";
import { fetchReleaseManifest } from "./fetch-release-manifest.js";

const REPOSITORY = "owner/offgrid";
const API_BASE_URL = "https://api.github.com";
const LATEST_URL = "https://api.github.com/repos/owner/offgrid/releases/latest";
const TAGGED_URL = "https://api.github.com/repos/owner/offgrid/releases/tags/v1.2.3";
const ASSET_URL = "https://api.github.com/repos/owner/offgrid/releases/assets/7";
const ASSET_REDIRECT_URL = "https://release-assets.githubusercontent.com/asset/7?sig=abc";

const digest = (character: string): string => character.repeat(64);

const manifest = {
  schemaVersion: 1,
  version: "1.2.3",
  commit: "b".repeat(40),
  images: {
    server: {
      reference: `ghcr.io/owner/offgrid-main-server@sha256:${digest("a")}`,
      platforms: ["linux/amd64"],
    },
    web: {
      reference: `ghcr.io/owner/offgrid-main-web@sha256:${digest("c")}`,
      platforms: ["linux/amd64"],
    },
  },
  minimumPreviousVersion: "1.0.0",
};

const releaseBody = {
  tag_name: "v1.2.3",
  assets: [{ id: 7, name: "release-manifest.json" }],
};

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const fakeFetch = (routes: Record<string, () => Response>): HttpFetch => {
  const httpFetch: HttpFetch = async (url) => {
    const route = routes[url];
    if (route === undefined) {
      throw new Error(`unexpected request to ${url}`);
    }
    return route();
  };
  return httpFetch;
};

const happyRoutes = (): Record<string, () => Response> => ({
  [TAGGED_URL]: () => jsonResponse(releaseBody),
  [LATEST_URL]: () => jsonResponse(releaseBody),
  [ASSET_URL]: () => new Response(null, { status: 302, headers: { location: ASSET_REDIRECT_URL } }),
  [ASSET_REDIRECT_URL]: () => jsonResponse(manifest),
});

describe("fetchReleaseManifest", () => {
  it("returns the manifest of the requested version, following the asset redirect", async () => {
    const result = await fetchReleaseManifest(
      fakeFetch(happyRoutes()),
      REPOSITORY,
      API_BASE_URL,
      "1.2.3",
    );

    expect(result).toEqual(manifest);
  });

  it("reads the latest release when no version is given", async () => {
    const result = await fetchReleaseManifest(
      fakeFetch(happyRoutes()),
      REPOSITORY,
      API_BASE_URL,
      null,
    );

    expect(result.version).toBe("1.2.3");
  });

  it("rejects a manifest that does not match the schema", async () => {
    const routes = happyRoutes();
    routes[ASSET_REDIRECT_URL] = () => jsonResponse({ ...manifest, schemaVersion: 2 });

    await expect(
      fetchReleaseManifest(fakeFetch(routes), REPOSITORY, API_BASE_URL, "1.2.3"),
    ).rejects.toThrow(ReleaseSourceError);
  });

  it("rejects a manifest whose version differs from the requested one", async () => {
    const routes = happyRoutes();
    routes["https://api.github.com/repos/owner/offgrid/releases/tags/v1.2.4"] = () =>
      jsonResponse(releaseBody);

    await expect(
      fetchReleaseManifest(fakeFetch(routes), REPOSITORY, API_BASE_URL, "1.2.4"),
    ).rejects.toThrow("release manifest version does not match the requested version");
  });

  it("refuses a redirect to a host that is not allowed", async () => {
    const routes = happyRoutes();
    routes[ASSET_URL] = () =>
      new Response(null, { status: 302, headers: { location: "https://evil.example/asset" } });

    await expect(
      fetchReleaseManifest(fakeFetch(routes), REPOSITORY, API_BASE_URL, "1.2.3"),
    ).rejects.toThrow("release source redirected to a host that is not allowed");
  });

  it("maps an HTTP error from the release lookup to a release source error", async () => {
    const routes = happyRoutes();
    routes[TAGGED_URL] = () => jsonResponse({ message: "Not Found" }, 404);

    await expect(
      fetchReleaseManifest(fakeFetch(routes), REPOSITORY, API_BASE_URL, "1.2.3"),
    ).rejects.toThrow("release lookup failed");
  });

  it("rejects a release that has no manifest asset", async () => {
    const routes = happyRoutes();
    routes[TAGGED_URL] = () => jsonResponse({ tag_name: "v1.2.3", assets: [] });

    await expect(
      fetchReleaseManifest(fakeFetch(routes), REPOSITORY, API_BASE_URL, "1.2.3"),
    ).rejects.toThrow("release has no manifest asset");
  });

  it("reads the release and the manifest from a configured release API base URL", async () => {
    const base = "https://releases.test:8443";
    const routes: Record<string, () => Response> = {
      [`${base}/repos/owner/offgrid/releases/tags/v1.2.3`]: () => jsonResponse(releaseBody),
      [`${base}/repos/owner/offgrid/releases/assets/7`]: () => jsonResponse(manifest),
    };

    const result = await fetchReleaseManifest(fakeFetch(routes), REPOSITORY, base, "1.2.3");

    expect(result).toEqual(manifest);
  });

  it("refuses an asset redirect to a host other than the configured one", async () => {
    const base = "https://releases.test:8443";
    const routes: Record<string, () => Response> = {
      [`${base}/repos/owner/offgrid/releases/tags/v1.2.3`]: () => jsonResponse(releaseBody),
      [`${base}/repos/owner/offgrid/releases/assets/7`]: () =>
        new Response(null, { status: 302, headers: { location: ASSET_REDIRECT_URL } }),
    };

    await expect(
      fetchReleaseManifest(fakeFetch(routes), REPOSITORY, base, "1.2.3"),
    ).rejects.toThrow("release source redirected to a host that is not allowed");
  });
});
