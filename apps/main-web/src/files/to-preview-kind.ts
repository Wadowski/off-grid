// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { baseMimeType } from "@offgrid/ui";
import { PREVIEW_KIND_BY_MEDIA_TYPE } from "./constants.js";
import type { PreviewKind } from "./types.js";

export const toPreviewKind = (mimeType: string): PreviewKind | null => {
  const mediaType = baseMimeType(mimeType);
  return Object.hasOwn(PREVIEW_KIND_BY_MEDIA_TYPE, mediaType)
    ? (PREVIEW_KIND_BY_MEDIA_TYPE[mediaType] ?? null)
    : null;
};
