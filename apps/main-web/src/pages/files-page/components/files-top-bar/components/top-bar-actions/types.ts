// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type TopBarActionsProps = {
  readonly uploadDisabled: boolean;
  readonly trashPath: string | null;
  readonly onFilesPicked: (files: readonly File[]) => void;
  readonly newFolderDisabled: boolean;
  readonly onNewFolder: () => void;
  readonly describedBy?: string;
};
