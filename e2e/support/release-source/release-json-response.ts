// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MANIFEST_FILE_NAME, NOT_FOUND_RESPONSE } from "./constants.js";
import { listReleaseVersions } from "./list-release-versions.js";
import { manifestAssetId } from "./manifest-asset-id.js";
import type { ReleaseResponse } from "./types.js";

export const releaseJsonResponse = async (
  directory: string,
  version: string,
): Promise<ReleaseResponse> => {
  const versions = await listReleaseVersions(directory);
  if (!versions.includes(version)) {
    return NOT_FOUND_RESPONSE;
  }
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      tag_name: `v${version}`,
      assets: [{ id: manifestAssetId(versions, version), name: MANIFEST_FILE_NAME }],
    }),
  };
};
