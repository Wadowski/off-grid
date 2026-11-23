// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { toParentFolderPath } from "./to-parent-folder-path.js";
import type { Breadcrumb, Drive, FileBackTarget } from "./types.js";

export const toFileBackTarget = (
  driveId: Drive["id"],
  breadcrumbs: readonly Breadcrumb[],
): FileBackTarget | null => {
  const parent = breadcrumbs.at(-2);
  const to = toParentFolderPath(driveId, breadcrumbs);
  if (parent === undefined || to === null) {
    return null;
  }
  return { to, name: parent.name };
};
