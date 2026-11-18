// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { HttpFetch, ReleaseManifest } from "../types.js";
import { RELEASE_ALLOWED_HOSTS, RELEASE_MANIFEST_ASSET_NAME } from "../constants.js";
import { ReleaseSourceError } from "./errors/release-source-error.js";
import { fetchAllowingHosts } from "./fetch-allowing-hosts.js";
import { fetchGithubRelease } from "./fetch-github-release.js";
import { parseReleaseManifest } from "./parse-release-manifest.js";
import { releaseAssetApiUrl } from "./release-asset-api-url.js";

export const fetchReleaseManifest = async (
  httpFetch: HttpFetch,
  repository: string,
  version: string | null,
): Promise<ReleaseManifest> => {
  const release = await fetchGithubRelease(httpFetch, repository, version);
  const asset = release.assets.find((candidate) => candidate.name === RELEASE_MANIFEST_ASSET_NAME);
  if (asset === undefined) {
    throw new ReleaseSourceError("release has no manifest asset");
  }
  const response = await fetchAllowingHosts(
    httpFetch,
    releaseAssetApiUrl(repository, asset.id),
    { accept: "application/octet-stream", "user-agent": "offgrid-updater" },
    RELEASE_ALLOWED_HOSTS,
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
