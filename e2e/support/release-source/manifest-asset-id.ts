// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ASSET_ID_STRIDE } from "./constants.js";

export const manifestAssetId = (versions: readonly string[], version: string): number =>
  (versions.indexOf(version) + 1) * ASSET_ID_STRIDE;
