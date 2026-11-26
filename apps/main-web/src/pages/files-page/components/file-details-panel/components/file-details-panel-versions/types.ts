// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { RegularFileEntry } from "../../../../../../files/types.js";

export type FileDetailsPanelVersionsProps = {
  readonly file: RegularFileEntry;
  readonly onFileChanged: () => void;
  readonly onDetailsChanged: () => Promise<void>;
};
