// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileListItem } from "../../files/types.js";
import type { DriveSwitcherProps } from "./components/drive-switcher/types.js";

export type FilesOutletContext = DriveSwitcherProps & {
  readonly selectedFileId: FileListItem["id"] | null;
  readonly onSelectFile: (fileId: FileListItem["id"]) => void;
  readonly onClearSelection: () => void;
};

export type FileSelection = {
  readonly pathname: string;
  readonly fileId: FileListItem["id"];
};
