// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FolderNodeState, FolderPickerNode, FolderTreeState } from "../../../../types.js";

export type FolderPickerProps = {
  readonly nodes: readonly FolderPickerNode[];
  readonly tree: FolderTreeState;
  readonly selectedId: string | null;
  readonly onSelect: (id: string) => void;
  readonly onExpand: (id: string) => void;
  readonly onRetry: (id: string) => void;
  readonly onLoadMore: (id: string) => void;
};

export type FolderPickerFooterProps = {
  readonly nodeId: string;
  readonly state: FolderNodeState | undefined;
  readonly onRetry: () => void;
  readonly onLoadMore: () => void;
};

export type FolderPickerCaptionProps = {
  readonly caption: "currentLocation" | "otherOwner";
};
