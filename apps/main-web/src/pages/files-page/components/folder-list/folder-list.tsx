// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, FileRow, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toFileRowValues } from "../../../../files/to-file-row-values.js";
import { toEntryPath } from "../../../../files/to-entry-path.js";
import { FileActionsMenu } from "../file-actions-menu/file-actions-menu.js";
import { folderListItemsStyle, folderListRowStyle, folderListStyle } from "./styles.js";
import type { FolderListProps } from "./types.js";

export const FolderList = ({
  driveId,
  items,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onDelete,
}: FolderListProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div style={folderListStyle} data-testid="files-folder-list">
      <ul
        aria-label={t("files.list.label")}
        aria-busy={isLoadingMore}
        data-testid="files-list"
        style={folderListItemsStyle}
      >
        {items.map((item) => (
          <li key={item.id} style={folderListRowStyle}>
            <FileRow
              {...toFileRowValues(item)}
              onActivate={() => navigate(toEntryPath(driveId, item))}
              trailing={
                <FileActionsMenu
                  entry={item}
                  onOpen={() => navigate(toEntryPath(driveId, item))}
                  onDelete={onDelete}
                />
              }
            />
          </li>
        ))}
      </ul>
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
