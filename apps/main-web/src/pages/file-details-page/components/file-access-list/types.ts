// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ListStatus } from "../../../../types.js";
import type { FileAccessEntry } from "../../../../files/types.js";

export type FileAccessListProps = {
  readonly status: ListStatus;
  readonly entries: readonly FileAccessEntry[];
  readonly familyDriveName: string | null;
  readonly onRetry: () => Promise<void>;
};
