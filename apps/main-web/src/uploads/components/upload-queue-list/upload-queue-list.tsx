// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { UploadQueueRow } from "../upload-queue-row/upload-queue-row.js";
import { uploadQueueListFooterStyle, uploadQueueListStyle } from "./styles.js";
import type { UploadQueueListProps } from "./types.js";

export const UploadQueueList = ({
  items,
  testIdPrefix,
  isIdle,
  onClearFinished,
}: UploadQueueListProps) => {
  const { t } = useTranslation();
  return (
    <>
      <ul
        aria-label={t("files.upload.queueLabel")}
        style={uploadQueueListStyle}
        data-testid={`${testIdPrefix}-list`}
      >
        {items.map((item) => (
          <UploadQueueRow key={item.id} item={item} testIdPrefix={testIdPrefix} />
        ))}
      </ul>
      {isIdle && items.length > 0 ? (
        <div style={uploadQueueListFooterStyle}>
          <Button
            variant="ghost"
            size="small"
            onClick={onClearFinished}
            data-testid={`${testIdPrefix}-clear`}
          >
            <Text variant="action" textId="files.upload.clear" element="span" />
          </Button>
        </div>
      ) : null}
    </>
  );
};
