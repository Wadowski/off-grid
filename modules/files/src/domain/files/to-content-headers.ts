// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { CACHE_CONTROL_NO_STORE_VALUE, DEFAULT_MIME_TYPE } from "../../constants.js";
import type { ContentHeaders, ContentHeadersInput } from "../../types.js";
import { resolveEffectiveDisposition } from "./resolve-effective-disposition.js";
import { toBaseMediaType } from "./to-base-media-type.js";
import { toContentDisposition } from "./to-content-disposition.js";
import { toContentLength } from "./to-content-length.js";
import { toContentRangeValue } from "./to-content-range-value.js";
import { toContentSecurityPolicy } from "./to-content-security-policy.js";

export const toContentHeaders = (input: ContentHeadersInput): ContentHeaders => {
  const disposition = resolveEffectiveDisposition(input.requestedDisposition, input.mediaType);
  const isInline = disposition === "inline";
  const headers: Record<string, string> = {
    "accept-ranges": "bytes",
    "cache-control": CACHE_CONTROL_NO_STORE_VALUE,
    "content-disposition": toContentDisposition(input.fileName, disposition),
    "content-length": String(toContentLength(input.sizeBytes, input.span)),
    "content-type": isInline ? toBaseMediaType(input.mediaType) : DEFAULT_MIME_TYPE,
    "x-content-type-options": "nosniff",
  };
  if (input.span !== null) {
    headers["content-range"] = toContentRangeValue(input.span, input.sizeBytes);
  }
  if (isInline) {
    headers["content-security-policy"] = toContentSecurityPolicy(input.mediaType);
  }
  return headers;
};
