// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fetchReleaseManifest } from "../release/fetch-release-manifest.js";
import type { ReleaseContext, ReleaseContextFailure, UpdaterServices } from "../types.js";

export const loadReleaseContext = async (
  services: UpdaterServices,
  requestedVersion: string | null,
): Promise<ReleaseContext | ReleaseContextFailure> => {
  const currentVersion = await services.currentVersion().catch(() => null);
  if (currentVersion === null) {
    services.logger.error("current version could not be read");
    return { ok: false, statusCode: 503, error: "current_version_unknown" };
  }
  const manifest = await fetchReleaseManifest(
    services.httpFetch,
    services.releaseRepository,
    requestedVersion,
  ).catch(() => null);
  if (manifest === null) {
    services.logger.error("release manifest could not be read");
    return { ok: false, statusCode: 502, error: "release_source_unreachable" };
  }
  return { ok: true, currentVersion, manifest };
};
