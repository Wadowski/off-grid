// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileVersionsState, RegularFileEntry } from "../../../../files/types.js";

export type FileDetailsVersionsProps = {
  readonly file: RegularFileEntry;
  readonly versions: FileVersionsState;
  readonly resolveName: (userId: string) => string | null;
  readonly refreshAll: () => void;
};
