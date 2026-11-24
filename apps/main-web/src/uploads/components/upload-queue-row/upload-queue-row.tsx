// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FileTypeIcon, ProgressBar, Text, fileKindFromMimeType } from "@offgrid/ui";
import { UploadQueueRowStatus } from "./components/upload-queue-row-status/upload-queue-row-status.js";
import { uploadQueueRowNameStyle, uploadQueueRowStyle, uploadQueueRowTopStyle } from "./styles.js";
import type { UploadQueueRowProps } from "./types.js";

export const UploadQueueRow = ({ item, testIdPrefix, alertOnFailure }: UploadQueueRowProps) => (
  <li style={uploadQueueRowStyle} data-testid={`${testIdPrefix}-row`} data-status={item.status}>
    <div style={uploadQueueRowTopStyle}>
      <FileTypeIcon kind={fileKindFromMimeType(item.mimeType, false)} size="sm" />
      <Text
        variant="body"
        value={item.name}
        element="span"
        title={item.name}
        style={uploadQueueRowNameStyle}
      />
      <UploadQueueRowStatus item={item} alertOnFailure={alertOnFailure} />
    </div>
    {item.status === "done" ? null : (
      <ProgressBar
        label={item.name}
        percent={item.status === "failed" ? 0 : item.percent}
        testId={`${testIdPrefix}-progress`}
      />
    )}
  </li>
);
