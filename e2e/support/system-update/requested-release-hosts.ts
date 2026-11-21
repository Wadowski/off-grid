// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readReleaseRequestLog } from "../release-source/read-release-request-log.js";
import { releaseSourceDirectory } from "../release-source/release-source-directory.js";

export const requestedReleaseHosts = async (): Promise<string[]> => [
  ...new Set((await readReleaseRequestLog(releaseSourceDirectory())).map((entry) => entry.host)),
];
