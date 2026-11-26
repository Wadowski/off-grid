// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DriveSwitcherProps } from "../../../../layouts/files-layout/components/drive-switcher/types.js";

export type FilesTopBarProps = Pick<DriveSwitcherProps, "drives" | "status" | "activeDriveId"> & {
  readonly uploadDisabled: boolean;
  readonly onFilesPicked: (files: readonly File[]) => void;
  readonly newFolderDisabled: boolean;
  readonly onNewFolder: () => void;
  readonly noDrive?: boolean;
};
