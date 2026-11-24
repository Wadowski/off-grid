// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type VersionUploadButtonProps = {
  readonly fileName: string;
  readonly onFilePicked: (file: File) => void;
};
