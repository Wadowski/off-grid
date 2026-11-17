// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FILE_SIZE_BASE, FILE_SIZE_UNITS } from "../constants.js";
import { roundToOneDecimal } from "./round-to-one-decimal.js";

export const formatFileSize = (bytes: number, locale?: string): string => {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "0 B";
  }
  if (bytes < FILE_SIZE_BASE) {
    return `${Math.round(bytes)} B`;
  }
  let unitIndex = 0;
  let value = bytes;
  while (value >= FILE_SIZE_BASE && unitIndex < FILE_SIZE_UNITS.length - 1) {
    value /= FILE_SIZE_BASE;
    unitIndex += 1;
  }
  if (roundToOneDecimal(value) >= FILE_SIZE_BASE && unitIndex < FILE_SIZE_UNITS.length - 1) {
    value /= FILE_SIZE_BASE;
    unitIndex += 1;
  }
  const number = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(roundToOneDecimal(value));
  return `${number} ${FILE_SIZE_UNITS[unitIndex]}`;
};
