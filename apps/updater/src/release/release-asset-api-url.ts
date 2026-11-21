// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const releaseAssetApiUrl = (
  apiBaseUrl: string,
  repository: string,
  assetId: number,
): string => `${apiBaseUrl}/repos/${repository}/releases/assets/${assetId}`;
