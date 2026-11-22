// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ByteSpan } from "../../types.js";

export const toContentRangeValue = (span: ByteSpan, sizeBytes: number): string =>
  `bytes ${span.start}-${span.end}/${sizeBytes}`;
