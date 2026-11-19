// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { HttpFetch, ReleaseManifest } from "../src/types.js";

export const RELEASE_TARGET_VERSION = "1.2.4";
export const RELEASE_MINIMUM_PREVIOUS_VERSION = "1.0.0";
export const RELEASE_REPOSITORY = "owner/offgrid";

const RELEASES_URL = `https://api.github.com/repos/${RELEASE_REPOSITORY}/releases/`;
const MANIFEST_ASSET_URL = `https://api.github.com/repos/${RELEASE_REPOSITORY}/releases/assets/7`;
const MANIFEST_DOWNLOAD_URL = "https://release-assets.githubusercontent.com/asset/7";

export const releaseManifestFixture = (version = RELEASE_TARGET_VERSION): ReleaseManifest => ({
  schemaVersion: 1,
  version,
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
  minimumPreviousVersion: RELEASE_MINIMUM_PREVIOUS_VERSION,
});

const jsonResponse = (body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

export const fakeReleaseSource =
  (manifest: ReleaseManifest = releaseManifestFixture()): HttpFetch =>
  async (url) => {
    if (url === MANIFEST_ASSET_URL) {
      return new Response(null, { status: 302, headers: { location: MANIFEST_DOWNLOAD_URL } });
    }
    if (url === MANIFEST_DOWNLOAD_URL) {
      return jsonResponse(manifest);
    }
    if (url.startsWith(RELEASES_URL)) {
      return jsonResponse({
        tag_name: `v${manifest.version}`,
        assets: [{ id: 7, name: "release-manifest.json" }],
      });
    }
    throw new Error(`unexpected request to ${url}`);
  };
