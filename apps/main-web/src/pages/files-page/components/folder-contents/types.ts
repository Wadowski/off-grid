// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Drive, FilesView, FolderContentsState } from "../../../../files/types.js";

export type FolderContentsProps = {
  readonly driveId: Drive["id"];
  readonly contents: FolderContentsState;
  readonly phone: boolean;
  readonly view: FilesView;
};
