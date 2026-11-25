// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Drive, FileEntry } from "../../types.js";

export type NewFolderDialogProps = {
  readonly driveId: Drive["id"];
  readonly parentId: FileEntry["id"] | null;
  readonly onCreated: () => void;
  readonly onClose: () => void;
};
