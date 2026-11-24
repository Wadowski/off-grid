// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ListStatus } from "../../../../types.js";
import type {
  FileVersionCompletion,
  FileVersionRow,
  FilesErrorTextId,
} from "../../../../files/types.js";

export type VersionsSectionVariant = "panel" | "screen";

export type FileVersionsSectionProps = {
  readonly variant: VersionsSectionVariant;
  readonly fileName: string;
  readonly rows: readonly FileVersionRow[];
  readonly status: ListStatus;
  readonly pendingVersionId: FileVersionRow["id"] | null;
  readonly errorTextId: FilesErrorTextId | null;
  readonly completed: FileVersionCompletion | null;
  readonly onUploadPicked: (file: File) => void;
  readonly onRetry: () => Promise<void>;
  readonly onRestore: (row: FileVersionRow) => void;
  readonly onDownload: (row: FileVersionRow) => void;
  readonly onDelete: (row: FileVersionRow) => void;
};
