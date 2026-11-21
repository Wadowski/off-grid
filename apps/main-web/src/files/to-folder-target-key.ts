// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FolderTarget } from "./types.js";

export const toFolderTargetKey = (target: FolderTarget): string =>
  target.kind === "drive" ? `drive:${target.driveId}` : `folder:${target.folderId}`;
