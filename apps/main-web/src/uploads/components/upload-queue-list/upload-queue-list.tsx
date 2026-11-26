// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import type { UploadItem } from "../../types.js";
import { UploadQueueRow } from "../upload-queue-row/upload-queue-row.js";
import { uploadQueueListFooterStyle, uploadQueueListStyle } from "./styles.js";
import type { UploadQueueListProps } from "./types.js";

export const UploadQueueList = ({
  items,
  testIdPrefix,
  isIdle,
  onClearFinished,
  canRetry,
  onRetry,
  onDismiss,
}: UploadQueueListProps) => {
  const { t } = useTranslation();
  const listRef = useRef<HTMLUListElement>(null);
  const retryAndKeepFocus = (id: UploadItem["id"]) => {
    onRetry(id);
    listRef.current?.focus();
  };
  const dismissAndKeepFocus = (id: UploadItem["id"]) => {
    onDismiss(id);
    listRef.current?.focus();
  };
  return (
    <>
      <ul
        ref={listRef}
        tabIndex={-1}
        aria-label={t("files.upload.queueLabel")}
        style={uploadQueueListStyle}
        data-testid={`${testIdPrefix}-list`}
      >
        {items.map((item) => (
          <UploadQueueRow
            key={item.id}
            item={item}
            testIdPrefix={testIdPrefix}
            canRetry={canRetry(item)}
            onRetry={retryAndKeepFocus}
            onDismiss={dismissAndKeepFocus}
          />
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
