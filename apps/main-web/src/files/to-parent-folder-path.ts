// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { toFolderPath } from "./to-folder-path.js";
import type { Breadcrumb, Drive } from "./types.js";

export const toParentFolderPath = (
  driveId: Drive["id"],
  breadcrumbs: readonly Breadcrumb[],
): string | null => {
  const parent = breadcrumbs.at(-2);
  if (parent === undefined) {
    return null;
  }
  return toFolderPath(driveId, parent.kind === "folder" ? parent.id : undefined);
};
