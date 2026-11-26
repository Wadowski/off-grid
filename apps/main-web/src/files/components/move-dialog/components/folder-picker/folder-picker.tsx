// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Tree } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { FolderPickerFooter } from "./folder-picker-footer.js";
import { folderPickerStyle } from "./styles.js";
import { toTreeNodes } from "./to-tree-nodes.js";
import type { FolderPickerProps } from "./types.js";

export const FolderPicker = ({
  nodes,
  tree,
  selectedId,
  onSelect,
  onExpand,
  onRetry,
  onLoadMore,
}: FolderPickerProps) => {
  const { t } = useTranslation();
  return (
    <div style={folderPickerStyle}>
      <Tree
        label={t("files.move.pickerLabel")}
        nodes={toTreeNodes(nodes)}
        expandedIds={tree.expandedIds}
        selectedId={selectedId}
        onSelect={onSelect}
        onToggle={onExpand}
        testId="move-dialog-tree"
        nodeTestIdPrefix="move-dialog-node-"
        renderFooter={(node) => (
          <FolderPickerFooter
            nodeId={node.id}
            state={tree.nodes[node.id]}
            onRetry={() => onRetry(node.id)}
            onLoadMore={() => onLoadMore(node.id)}
          />
        )}
      />
    </div>
  );
};
