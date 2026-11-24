// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { PREVIEW_KINDS } from "./constants.js";
import type { PreviewKind } from "./types.js";

export const toPreviewKind = (mimeType: string): PreviewKind | null => {
  const mediaType = (mimeType.split(";")[0] ?? "").trim().toLowerCase();
  const match = Object.entries(PREVIEW_KINDS).find(([, mediaTypes]) =>
    mediaTypes.includes(mediaType),
  );
  return match === undefined ? null : (match[0] as PreviewKind);
};
