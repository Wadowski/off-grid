// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ByteSpan } from "../../types.js";

export const toContentLength = (sizeBytes: number, span: ByteSpan | null): number =>
  span === null ? sizeBytes : span.end - span.start + 1;
