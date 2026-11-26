// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";

export type FileDropZoneProps = {
  readonly enabled: boolean;
  readonly folderName: string | null;
  readonly onFilesDropped: (files: readonly File[]) => void;
  readonly children: ReactNode;
};
