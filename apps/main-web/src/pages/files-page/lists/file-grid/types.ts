// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Drive, FileListItem } from "../../../../files/types.js";
import type { EntryActionRequest, MoveRequest } from "../../components/file-actions-menu/types.js";

export type FileGridProps = {
  readonly driveId: Drive["id"];
  readonly items: readonly FileListItem[];
  readonly hasMore: boolean;
  readonly isLoadingMore: boolean;
  readonly onLoadMore: () => Promise<void>;
  readonly selectedId: FileListItem["id"] | null;
  readonly onSelect: (id: FileListItem["id"]) => void;
  readonly onRename: EntryActionRequest;
  readonly onDelete: EntryActionRequest;
  readonly onMove: MoveRequest;
};
