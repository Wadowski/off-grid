// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useEffect, useMemo, useState } from "react";
import { findFolderPickerNode } from "./find-folder-picker-node.js";
import { toFolderPickerNodes } from "./to-folder-picker-nodes.js";
import { toIsCrossOwnerTarget } from "./to-is-cross-owner-target.js";
import { toIsValidMoveTarget } from "./to-is-valid-move-target.js";
import { toMoveTarget } from "./to-move-target.js";
import { useFolderTree } from "./use-folder-tree.js";
import { useMoveEntry } from "./use-move-entry.js";
import type {
  Drive,
  FolderTreeNodeRef,
  MoveDialogState,
  MoveDialogStep,
  MoveNotice,
  MoveSource,
} from "./types.js";

export const useMoveDialog = (
  drives: readonly Drive[],
  source: MoveSource,
  returnFocusTo: HTMLElement | null,
  onMoved: (notice: MoveNotice) => void,
): MoveDialogState => {
  const tree = useFolderTree();
  const mover = useMoveEntry();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const nodes = useMemo(
    () => toFolderPickerNodes(drives, tree.nodes, source),
    [drives, tree.nodes, source],
  );
  const selected = selectedId === null ? null : findFolderPickerNode(nodes, selectedId);
  const canMove = selected !== null && toIsValidMoveTarget(selected);
  const isCrossOwner =
    selected !== null && toIsCrossOwnerTarget(drives, source.driveId, selected.driveId);
  const step: MoveDialogStep =
    mover.status === "moving" ? "moving" : confirming ? "confirmingCrossOwner" : "idle";

  useEffect(
    () => () => {
      if (returnFocusTo !== null && returnFocusTo.isConnected) {
        returnFocusTo.focus();
      }
    },
    [returnFocusTo],
  );

  const select = (id: string) => {
    setSelectedId(id);
    setConfirming(false);
  };

  const toNodeRef = (id: string): FolderTreeNodeRef | null => {
    const node = findFolderPickerNode(nodes, id);
    return node === null ? null : { id: node.id, driveId: node.driveId, folderId: node.folderId };
  };

  const expand = (id: string) => {
    const ref = toNodeRef(id);
    if (ref !== null) {
      tree.toggle(ref);
    }
  };

  const retry = (id: string) => {
    const ref = toNodeRef(id);
    if (ref !== null) {
      tree.reload(ref);
    }
  };

  const loadMore = (id: string) => {
    const ref = toNodeRef(id);
    if (ref !== null) {
      tree.loadMore(ref);
    }
  };

  const submit = async () => {
    if (selected === null || !canMove || step === "moving") {
      return;
    }
    if (isCrossOwner && !confirming) {
      setConfirming(true);
      return;
    }
    const result = await mover.move(source.entryId, toMoveTarget(selected));
    if (result !== null) {
      onMoved({
        entryName: source.entryName,
        targetName: selected.label,
        crossOwnerNotice: result.crossOwnerNotice,
      });
    }
  };

  return {
    nodes,
    tree,
    selectedId,
    step,
    errorTextId: mover.errorTextId,
    canMove,
    isCrossOwner,
    select,
    expand,
    retry,
    loadMore,
    submit,
  };
};
