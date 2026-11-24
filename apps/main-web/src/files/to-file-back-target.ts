// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { toFolderPath } from "./to-folder-path.js";
import type { Breadcrumb, Drive, FileBackTarget } from "./types.js";

export const toFileBackTarget = (
  driveId: Drive["id"],
  breadcrumbs: readonly Breadcrumb[],
): FileBackTarget | null => {
  const container = breadcrumbs.at(-1);
  if (container === undefined) {
    return null;
  }
  const folderId = container.kind === "folder" ? container.id : undefined;
  return { to: toFolderPath(driveId, folderId), name: container.name };
};
