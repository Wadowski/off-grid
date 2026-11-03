// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { UNIQUE_VIOLATION_CODE } from "../../constants.js";

export const uniqueViolationModel = (error: unknown): string | null => {
  if (typeof error !== "object" || error === null) {
    return null;
  }
  const { code, meta } = error as { code?: unknown; meta?: { modelName?: unknown } };
  if (code !== UNIQUE_VIOLATION_CODE || typeof meta?.modelName !== "string") {
    return null;
  }
  return meta.modelName;
};
