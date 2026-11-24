// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Breadcrumb, RegularFileEntry } from "../../../../../../files/types.js";

export type FileDetailsPanelBodyProps = {
  readonly file: RegularFileEntry;
  readonly breadcrumbs: readonly Breadcrumb[];
};
