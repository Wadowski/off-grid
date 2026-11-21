// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { HttpFetch, ReleaseManifest } from "../types.js";
import { RELEASE_MANIFEST_ASSET_NAME } from "../constants.js";
import { ReleaseSourceError } from "./errors/release-source-error.js";
import { fetchAllowingHosts } from "./fetch-allowing-hosts.js";
import { fetchGithubRelease } from "./fetch-github-release.js";
import { parseReleaseManifest } from "./parse-release-manifest.js";
import { releaseAllowedHosts } from "./release-allowed-hosts.js";
import { releaseAssetApiUrl } from "./release-asset-api-url.js";

export const fetchReleaseManifest = async (
  httpFetch: HttpFetch,
  repository: string,
  apiBaseUrl: string,
  version: string | null,
): Promise<ReleaseManifest> => {
  const release = await fetchGithubRelease(httpFetch, repository, apiBaseUrl, version);
  const asset = release.assets.find((candidate) => candidate.name === RELEASE_MANIFEST_ASSET_NAME);
  if (asset === undefined) {
    throw new ReleaseSourceError("release has no manifest asset");
  }
  const response = await fetchAllowingHosts(
    httpFetch,
    releaseAssetApiUrl(apiBaseUrl, repository, asset.id),
    { accept: "application/octet-stream", "user-agent": "offgrid-updater" },
    releaseAllowedHosts(apiBaseUrl),
  );
  if (!response.ok) {
    throw new ReleaseSourceError("release manifest download failed");
  }
  const manifest = parseReleaseManifest(await response.text());
  if (version !== null && manifest.version !== version) {
    throw new ReleaseSourceError("release manifest version does not match the requested version");
  }
  return manifest;
};
