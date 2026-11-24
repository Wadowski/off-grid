// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileActivityEntry, FileVersion } from "./types.js";

export const toFileActivityEntries = (
  versions: readonly FileVersion[],
  resolveName: (userId: string) => string | null,
): readonly FileActivityEntry[] =>
  versions
    .map((version) => ({
      id: version.id,
      number: version.number,
      createdAt: new Date(version.createdAt),
      name: resolveName(version.createdByUserId),
    }))
    .sort((first, second) => second.number - first.number);
