// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileRecord } from "../../types.js";

export const subtreeFingerprint = (entries: readonly FileRecord[]): string[] =>
  entries
    .map(
      (entry) =>
        `${entry.fileId}|${entry.parentId ?? ""}|${entry.name}|${entry.version}|${entry.currentVersionId ?? ""}|${entry.deletedAt?.toISOString() ?? ""}`,
    )
    .sort();
