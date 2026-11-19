// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FILES_FILE_MODEL, UNIQUE_VIOLATION_CODE } from "../../constants.js";

export const isNameConflict = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const { code, meta } = error as { code?: unknown; meta?: { modelName?: unknown } };
  return code === UNIQUE_VIOLATION_CODE && meta?.modelName === FILES_FILE_MODEL;
};
