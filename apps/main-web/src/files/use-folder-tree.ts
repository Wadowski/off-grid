// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useRef, useState } from "react";
import { DEFAULT_FILES_SORT_ORDER } from "./constants.js";
import { fetchFolderPage } from "./fetch-folder-page.js";
import { toFailedFolderNode } from "./to-failed-folder-node.js";
import { toFilesErrorTextId } from "./to-files-error-text-id.js";
import { toLoadedFolderNode } from "./to-loaded-folder-node.js";
import { toLoadingFolderNode } from "./to-loading-folder-node.js";
import { toToggledExpandedIds } from "./to-toggled-expanded-ids.js";
import type { FolderNodeState, FolderTreeNodeRef, FolderTreeState } from "./types.js";

export const useFolderTree = (): FolderTreeState => {
  const [nodes, setNodes] = useState<Readonly<Record<string, FolderNodeState>>>({});
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(new Set());
  const requestTokens = useRef(new Map<string, number>());

  const loadPage = useCallback(async (node: FolderTreeNodeRef, cursor: string | null) => {
    const token = (requestTokens.current.get(node.id) ?? 0) + 1;
    requestTokens.current.set(node.id, token);
    const isLatest = (): boolean => requestTokens.current.get(node.id) === token;
    setNodes((previous) => ({
      ...previous,
      [node.id]: toLoadingFolderNode(previous[node.id], node, cursor),
    }));
    try {
      const page = await fetchFolderPage(
        node.driveId,
        node.folderId,
        cursor,
        DEFAULT_FILES_SORT_ORDER,
      );
      if (isLatest()) {
        setNodes((previous) => ({
          ...previous,
          [node.id]: toLoadedFolderNode(previous[node.id], node, page, cursor === null),
        }));
      }
    } catch (error) {
      if (isLatest()) {
        setNodes((previous) => ({
          ...previous,
          [node.id]: toFailedFolderNode(previous[node.id], node, toFilesErrorTextId(error)),
        }));
      }
    }
  }, []);

  const toggle = useCallback(
    (node: FolderTreeNodeRef) => {
      const opens = !expandedIds.has(node.id);
      setExpandedIds((previous) => toToggledExpandedIds(previous, node.id));
      const state = nodes[node.id];
      if (opens && (state === undefined || state.status === "failed")) {
        void loadPage(node, null);
      }
    },
    [expandedIds, nodes, loadPage],
  );

  const loadMore = useCallback(
    (node: FolderTreeNodeRef) => {
      const cursor = nodes[node.id]?.nextCursor ?? null;
      if (cursor !== null) {
        void loadPage(node, cursor);
      }
    },
    [nodes, loadPage],
  );

  const reload = useCallback(
    (node: FolderTreeNodeRef) => {
      void loadPage(node, null);
    },
    [loadPage],
  );

  return { nodes, expandedIds, toggle, reload, loadMore };
};
