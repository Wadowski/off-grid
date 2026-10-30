// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { normalizeKey } from "./normalize-key.js";
import { SENSITIVE_WORDS } from "./constants.js";

export const isSensitiveKey = (key: string, personalKeys: ReadonlySet<string>): boolean => {
  const normalized = normalizeKey(key);
  return personalKeys.has(normalized) || SENSITIVE_WORDS.some((word) => normalized.includes(word));
};
