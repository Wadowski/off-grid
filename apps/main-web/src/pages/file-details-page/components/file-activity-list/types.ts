// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ListStatus } from "../../../../types.js";
import type { FileActivityEntry } from "../../../../files/types.js";

export type FileActivityListProps = {
  readonly status: ListStatus;
  readonly entries: readonly FileActivityEntry[];
  readonly onRetry: () => Promise<void>;
};
