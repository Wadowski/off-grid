// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Drive, FileListItem } from "../../../../files/types.js";

export type FileGridProps = {
  readonly driveId: Drive["id"];
  readonly items: readonly FileListItem[];
  readonly hasMore: boolean;
  readonly isLoadingMore: boolean;
  readonly onLoadMore: () => Promise<void>;
  readonly selectedId: string | null;
  readonly onSelect: (id: string) => void;
};
