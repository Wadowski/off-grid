// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileVersion } from "./types.js";

export const toModifiedBy = (
  currentVersionId: FileVersion["id"],
  versions: readonly FileVersion[],
  resolveName: (userId: string) => string | null,
): string | null => {
  const currentVersion = versions.find((version) => version.id === currentVersionId);
  return currentVersion === undefined ? null : resolveName(currentVersion.createdByUserId);
};
