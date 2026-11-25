// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Breadcrumb, FileListItem } from "../../files/types.js";

export const toTrashClearsSelection = (
  trashedId: FileListItem["id"],
  selectedFileId: FileListItem["id"] | null,
  folderChain: readonly Breadcrumb[],
): boolean =>
  selectedFileId !== null &&
  (trashedId === selectedFileId ||
    folderChain.some((crumb) => crumb.kind === "folder" && crumb.id === trashedId));
