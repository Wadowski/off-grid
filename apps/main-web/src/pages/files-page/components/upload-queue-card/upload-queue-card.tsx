// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Card, Text } from "@offgrid/ui";
import { UploadQueueList } from "../../../../uploads/components/upload-queue-list/upload-queue-list.js";
import { useUploadQueueContext } from "../../../../uploads/index.js";
import { uploadQueueCardHeadingStyle, uploadQueueCardStyle } from "./styles.js";

export const UploadQueueCard = () => {
  const queue = useUploadQueueContext();
  if (queue.items.length === 0) {
    return null;
  }
  return (
    <div style={uploadQueueCardStyle} data-testid="upload-queue-inline">
      <Card>
        <Text
          variant="label"
          textId="files.upload.heading"
          element="p"
          style={uploadQueueCardHeadingStyle}
        />
        <UploadQueueList
          items={queue.items}
          testIdPrefix="upload-queue-inline"
          alertOnFailure
          isIdle={queue.isIdle}
          onClearFinished={queue.clearFinished}
        />
      </Card>
    </div>
  );
};
