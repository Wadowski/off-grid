// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MANIFEST_FILE_NAME, NOT_FOUND_RESPONSE } from "./constants.js";
import { listReleaseVersions } from "./list-release-versions.js";
import { manifestAssetId } from "./manifest-asset-id.js";
import { readReleaseFile } from "./read-release-file.js";
import type { ReleaseResponse } from "./types.js";

export const assetResponse = async (
  directory: string,
  assetId: number,
): Promise<ReleaseResponse> => {
  const versions = await listReleaseVersions(directory);
  const version = versions.find((candidate) => manifestAssetId(versions, candidate) === assetId);
  return version === undefined
    ? NOT_FOUND_RESPONSE
    : readReleaseFile(directory, version, MANIFEST_FILE_NAME);
};
