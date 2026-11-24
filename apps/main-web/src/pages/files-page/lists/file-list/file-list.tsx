// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, FileTable, FileTableRow, Text } from "@offgrid/ui";
import { useNavigate } from "react-router-dom";
import { toFileRowValues } from "../../../../files/to-file-row-values.js";
import { toFolderPath } from "../../../../files/to-folder-path.js";
import { fileListStyle } from "./styles.js";
import type { FileListProps } from "./types.js";

export const FileList = ({
  driveId,
  items,
  hasMore,
  isLoadingMore,
  selectedId,
  onSelect,
  onLoadMore,
}: FileListProps) => {
  const navigate = useNavigate();

  return (
    <div style={fileListStyle} data-testid="files-file-list">
      <FileTable isBusy={isLoadingMore}>
        {items.map((item) => (
          <FileTableRow
            key={item.id}
            {...toFileRowValues(item)}
            selected={item.id === selectedId}
            onActivate={
              item.isFolder
                ? () => navigate(toFolderPath(driveId, item.id))
                : () => onSelect(item.id)
            }
          />
        ))}
      </FileTable>
      {hasMore ? (
        <Button
          type="button"
          variant="secondary"
          fullWidth
          disabled={isLoadingMore}
          onClick={() => void onLoadMore()}
          data-testid="files-load-more"
        >
          <Text variant="action" textId="files.folder.loadMore" />
        </Button>
      ) : null}
    </div>
  );
};
