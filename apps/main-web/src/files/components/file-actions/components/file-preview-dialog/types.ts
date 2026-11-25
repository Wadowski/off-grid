// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileDownload, RegularFileEntry } from "../../../../types.js";

export type FilePreviewDialogProps = {
  readonly file: RegularFileEntry;
  readonly download: FileDownload;
  readonly onClose: () => void;
};
