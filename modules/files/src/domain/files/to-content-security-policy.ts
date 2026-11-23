// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  INLINE_IMAGE_CONTENT_SECURITY_POLICY,
  INLINE_PDF_CONTENT_SECURITY_POLICY,
  PDF_MEDIA_TYPE,
} from "../../constants.js";
import { toBaseMediaType } from "./to-base-media-type.js";

export const toContentSecurityPolicy = (mediaType: string): string =>
  toBaseMediaType(mediaType) === PDF_MEDIA_TYPE
    ? INLINE_PDF_CONTENT_SECURITY_POLICY
    : INLINE_IMAGE_CONTENT_SECURITY_POLICY;
