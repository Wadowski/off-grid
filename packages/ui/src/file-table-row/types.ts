// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ReactNode } from "react";
import type { FileEntryProps } from "../files/types.js";
import type { FileTableVariant } from "../file-table/types.js";

export type FileTableRowProps = Omit<FileEntryProps, "trailing"> & {
  readonly actions?: ReactNode;
  readonly variant?: FileTableVariant;
};
