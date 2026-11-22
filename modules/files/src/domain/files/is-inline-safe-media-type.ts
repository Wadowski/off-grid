// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { INLINE_SAFE_MEDIA_TYPES } from "../../constants.js";
import { toBaseMediaType } from "./to-base-media-type.js";

export const isInlineSafeMediaType = (mediaType: string): boolean =>
  INLINE_SAFE_MEDIA_TYPES.has(toBaseMediaType(mediaType));
