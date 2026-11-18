// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { HttpFetch } from "../types.js";
import { GITHUB_API_HOST } from "../constants.js";
import { ReleaseSourceError } from "./errors/release-source-error.js";
import { fetchAllowingHosts } from "./fetch-allowing-hosts.js";
import { githubReleaseSchema } from "./github-release-schema.js";
import { releaseApiUrl } from "./release-api-url.js";

export const fetchGithubRelease = async (
  httpFetch: HttpFetch,
  repository: string,
  version: string | null,
) => {
  const response = await fetchAllowingHosts(
    httpFetch,
    releaseApiUrl(repository, version),
    { accept: "application/vnd.github+json", "user-agent": "offgrid-updater" },
    [GITHUB_API_HOST],
  );
  if (!response.ok) {
    throw new ReleaseSourceError("release lookup failed");
  }
  const parsed = githubReleaseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new ReleaseSourceError("release response does not match the expected shape");
  }
  return parsed.data;
};
