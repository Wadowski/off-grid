// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { GITHUB_API_HOST } from "../constants.js";

export const releaseApiUrl = (repository: string, version: string | null): string =>
  version === null
    ? `https://${GITHUB_API_HOST}/repos/${repository}/releases/latest`
    : `https://${GITHUB_API_HOST}/repos/${repository}/releases/tags/v${version}`;
