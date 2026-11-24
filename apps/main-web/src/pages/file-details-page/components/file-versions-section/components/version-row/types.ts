// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileVersionRow } from "../../../../../../files/types.js";

export type VersionRowProps = {
  readonly row: FileVersionRow;
  readonly pending: boolean;
  readonly onRestore: () => void;
  readonly onDownload: () => void;
  readonly onRequestDelete: () => void;
};
