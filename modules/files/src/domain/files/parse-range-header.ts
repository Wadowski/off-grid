// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { SINGLE_BYTE_RANGE_PATTERN } from "../../constants.js";
import type { ByteSpan } from "../../types.js";
import { resolveRangeSpan } from "./resolve-range-span.js";

export const parseRangeHeader = (
  header: string | undefined,
  sizeBytes: number,
): ByteSpan | "unsatisfiable" | null => {
  if (header === undefined) {
    return null;
  }
  const match = SINGLE_BYTE_RANGE_PATTERN.exec(header.trim());
  if (match === null) {
    return null;
  }
  const startText = match[1] ?? "";
  const endText = match[2] ?? "";
  if (startText === "" && endText === "") {
    return null;
  }
  return resolveRangeSpan(sizeBytes, startText, endText);
};
