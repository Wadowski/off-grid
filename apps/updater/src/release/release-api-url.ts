// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const releaseApiUrl = (
  apiBaseUrl: string,
  repository: string,
  version: string | null,
): string =>
  version === null
    ? `${apiBaseUrl}/repos/${repository}/releases/latest`
    : `${apiBaseUrl}/repos/${repository}/releases/tags/v${version}`;
