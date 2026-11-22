// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ContentDisposition } from "../../types.js";
import { isInlineSafeMediaType } from "./is-inline-safe-media-type.js";

export const resolveEffectiveDisposition = (
  requested: ContentDisposition,
  mediaType: string,
): ContentDisposition =>
  requested === "inline" && isInlineSafeMediaType(mediaType) ? "inline" : "attachment";
