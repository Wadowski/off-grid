// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { GITHUB_API_HOST } from "../constants.js";

export const releaseAssetApiUrl = (repository: string, assetId: number): string =>
  `https://${GITHUB_API_HOST}/repos/${repository}/releases/assets/${assetId}`;
