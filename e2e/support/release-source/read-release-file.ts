// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NOT_FOUND_RESPONSE, RELEASE_FILE_NAMES, RELEASES_FOLDER } from "./constants.js";
import type { ReleaseResponse } from "./types.js";

export const readReleaseFile = async (
  directory: string,
  version: string,
  fileName: string,
): Promise<ReleaseResponse> => {
  if (!RELEASE_FILE_NAMES.some((name) => name === fileName)) {
    return NOT_FOUND_RESPONSE;
  }
  const body = await readFile(join(directory, RELEASES_FOLDER, version, fileName)).catch(
    () => null,
  );
  return body === null
    ? NOT_FOUND_RESPONSE
    : { status: 200, contentType: "application/octet-stream", body };
};
