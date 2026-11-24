// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type FilesHeaderProps = {
  readonly driveName: string | undefined;
  readonly uploadDisabled: boolean;
  readonly onFilesPicked: (files: readonly File[]) => void;
};
