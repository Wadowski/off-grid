// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Breadcrumb, FileBackTarget, RegularFileEntry } from "../../../../files/types.js";

export type FileDetailsReadyProps = {
  readonly file: RegularFileEntry;
  readonly breadcrumbs: readonly Breadcrumb[];
  readonly backTarget: FileBackTarget | null;
};
