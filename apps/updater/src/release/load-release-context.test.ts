// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createSilentLogger } from "../../test/silent-logger.js";
import { createRunLock } from "../run/create-run-lock.js";
import type { HttpFetch, UpdateStatus, UpdaterServices } from "../types.js";
import { loadReleaseContext } from "./load-release-context.js";

const TARGET_VERSION = "1.2.4";
const RELEASES_URL = "https://api.github.com/repos/owner/offgrid/releases/";
const MANIFEST_ASSET_URL = "https://api.github.com/repos/owner/offgrid/releases/assets/7";
const MANIFEST_DOWNLOAD_URL = "https://release-assets.githubusercontent.com/asset/7";

const manifest = {
  schemaVersion: 1,
  version: TARGET_VERSION,
  commit: "b".repeat(40),
  images: {
    server: {
      reference: `ghcr.io/owner/offgrid-main-server@sha256:${"c".repeat(64)}`,
      platforms: ["linux/amd64"],
    },
    web: {
      reference: `ghcr.io/owner/offgrid-main-web@sha256:${"d".repeat(64)}`,
      platforms: ["linux/amd64"],
    },
  },
  minimumPreviousVersion: "1.0.0",
};

const jsonResponse = (body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

const releaseSource = (): HttpFetch => async (url) => {
  if (url === MANIFEST_ASSET_URL) {
    return new Response(null, { status: 302, headers: { location: MANIFEST_DOWNLOAD_URL } });
  }
  if (url === MANIFEST_DOWNLOAD_URL) {
    return jsonResponse(manifest);
  }
  if (url.startsWith(RELEASES_URL)) {
    return jsonResponse({
      tag_name: `v${TARGET_VERSION}`,
      assets: [{ id: 7, name: "release-manifest.json" }],
    });
  }
  throw new Error(`unexpected request to ${url}`);
};

const unusedRunApply = async (): Promise<UpdateStatus> => {
  throw new Error("runApply is not used by loadReleaseContext");
};

const buildServices = (
  overrides: Partial<Pick<UpdaterServices, "currentVersion" | "httpFetch">>,
): UpdaterServices => ({
  apiToken: "updater-test-token-value",
  statusFile: "unused/status.json",
  releaseRepository: "owner/offgrid",
  runLock: createRunLock(),
  httpFetch: releaseSource(),
  logger: createSilentLogger(),
  currentVersion: async () => "1.2.3",
  runApply: unusedRunApply,
  ...overrides,
});

describe("loadReleaseContext", () => {
  it("returns the running version and the latest release manifest", async () => {
    const context = await loadReleaseContext(buildServices({}), null);

    expect(context).toEqual({ ok: true, currentVersion: "1.2.3", manifest });
  });

  it("refuses with 503 and does not read the release source when the running version is unknown", async () => {
    let releaseSourceRead = false;
    const services = buildServices({
      currentVersion: async () => {
        throw new Error("no server image label");
      },
      httpFetch: async () => {
        releaseSourceRead = true;
        throw new Error("release source must not be read");
      },
    });

    const context = await loadReleaseContext(services, null);

    expect(context).toEqual({
      ok: false,
      statusCode: 503,
      error: "current_version_unknown",
    });
    expect(releaseSourceRead).toBe(false);
  });

  it("refuses with 502 when the release source cannot be read", async () => {
    const services = buildServices({
      httpFetch: async () => {
        throw new Error("offline");
      },
    });

    const context = await loadReleaseContext(services, null);

    expect(context).toEqual({
      ok: false,
      statusCode: 502,
      error: "release_source_unreachable",
    });
  });

  it("refuses with 502 when the manifest version is not the requested version", async () => {
    const context = await loadReleaseContext(buildServices({}), "1.2.5");

    expect(context).toEqual({
      ok: false,
      statusCode: 502,
      error: "release_source_unreachable",
    });
  });
});
