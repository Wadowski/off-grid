// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileVersion, FileVersionRow } from "./types.js";

export const toFileVersionRows = (
  versions: readonly FileVersion[],
  resolveName: (userId: string) => string | null,
): readonly FileVersionRow[] => {
  const currentNumber = Math.max(0, ...versions.map((version) => version.number));
  return versions
    .map((version) => ({
      id: version.id,
      number: version.number,
      sizeBytes: version.size,
      createdAt: new Date(version.createdAt),
      authorName: resolveName(version.createdByUserId),
      isCurrent: version.number === currentNumber,
    }))
    .sort((first, second) => second.number - first.number);
};
