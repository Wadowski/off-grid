// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useNavigate } from "react-router-dom";
import { splitFoldersAndFiles } from "../../../../files/split-folders-and-files.js";
import { toFolderPath } from "../../../../files/to-folder-path.js";
import type { FileListItem } from "../../../../files/types.js";
import { FileGridGroup } from "./components/file-grid-group/file-grid-group.js";
import { fileGridStyle } from "./styles.js";
import type { FileGridProps } from "./types.js";

export const FileGrid = ({
  driveId,
  items,
  hasMore,
  isLoadingMore,
  onLoadMore,
  selectedId,
  onSelect,
  onDelete,
}: FileGridProps) => {
  const navigate = useNavigate();
  const { folders, files } = splitFoldersAndFiles(items);

  const activate = (item: FileListItem) => {
    if (item.isFolder) {
      navigate(toFolderPath(driveId, item.id));
      return;
    }
    onSelect(item.id);
  };

  return (
    <>
      <div style={fileGridStyle} aria-busy={isLoadingMore} data-testid="files-file-grid">
        {folders.length > 0 ? (
          <FileGridGroup
            labelTextId="files.grid.folders"
            testId="files-file-grid-folders"
            items={folders}
            selectedId={selectedId}
            onActivate={activate}
            onDelete={onDelete}
          />
        ) : null}
        {files.length > 0 ? (
          <FileGridGroup
            labelTextId="files.grid.files"
            testId="files-file-grid-files"
            items={files}
            selectedId={selectedId}
            onActivate={activate}
            onDelete={onDelete}
          />
        ) : null}
      </div>
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
    </>
  );
};
