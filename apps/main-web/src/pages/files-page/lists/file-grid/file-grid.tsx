// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, FileCard, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toFileRowValues } from "../../../../files/to-file-row-values.js";
import { toFolderPath } from "../../../../files/to-folder-path.js";
import { fileGridItemStyle, fileGridStyle } from "./styles.js";
import type { FileGridProps } from "./types.js";

export const FileGrid = ({
  driveId,
  items,
  hasMore,
  isLoadingMore,
  onLoadMore,
  selectedId,
  onSelect,
}: FileGridProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <div
        role="list"
        aria-label={t("files.list.label")}
        aria-busy={isLoadingMore}
        style={fileGridStyle}
        data-testid="files-file-grid"
      >
        {items.map((item) => (
          <div key={item.id} role="listitem" style={fileGridItemStyle}>
            <FileCard
              {...toFileRowValues(item)}
              selected={item.id === selectedId}
              onActivate={
                item.isFolder
                  ? () => navigate(toFolderPath(driveId, item.id))
                  : () => onSelect(item.id)
              }
            />
          </div>
        ))}
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
