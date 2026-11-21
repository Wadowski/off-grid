// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { NOT_FOUND_RESPONSE } from "./constants.js";
import { assetResponse } from "./asset-response.js";
import { matchReleaseRoute } from "./match-release-route.js";
import { readLatestVersion } from "./read-latest-version.js";
import { readReleaseFile } from "./read-release-file.js";
import { releaseJsonResponse } from "./release-json-response.js";
import type { ReleaseResponse } from "./types.js";

export const buildReleaseResponse = async (
  directory: string,
  path: string,
): Promise<ReleaseResponse> => {
  const route = matchReleaseRoute(path);
  if (route === null) {
    return NOT_FOUND_RESPONSE;
  }
  switch (route.kind) {
    case "latest-release":
      return releaseJsonResponse(directory, await readLatestVersion(directory));
    case "tagged-release":
      return releaseJsonResponse(directory, route.version);
    case "asset":
      return assetResponse(directory, route.assetId);
    case "latest-download":
      return readReleaseFile(directory, await readLatestVersion(directory), route.fileName);
    case "versioned-download":
      return readReleaseFile(directory, route.version, route.fileName);
  }
};
