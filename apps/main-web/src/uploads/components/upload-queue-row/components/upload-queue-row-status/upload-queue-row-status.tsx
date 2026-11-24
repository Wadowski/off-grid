// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MaterialIcon, Text, cssVar } from "@offgrid/ui";
import { uploadQueueRowStatusStyle } from "./styles.js";
import type { UploadQueueRowStatusProps } from "./types.js";

const StatusContent = ({ item, alertOnFailure }: UploadQueueRowStatusProps) => {
  switch (item.status) {
    case "done":
      return (
        <>
          <MaterialIcon name="check_circle" size="1rem" color={cssVar("color-good")} filled />
          <Text variant="caption" textId="files.upload.done" element="span" />
        </>
      );
    case "failed":
      return (
        <>
          <MaterialIcon name="error" size="1rem" color={cssVar("color-danger")} filled />
          <Text
            variant="error"
            textId={item.errorTextId ?? "files.errors.failed"}
            element="span"
            role={alertOnFailure ? "alert" : undefined}
          />
        </>
      );
    case "uploading":
      return (
        <Text
          variant="caption"
          textId="files.upload.percent"
          values={{ percent: item.percent }}
          element="span"
        />
      );
    case "queued":
      return <Text variant="caption" textId="files.upload.waiting" element="span" />;
  }
};

export const UploadQueueRowStatus = (props: UploadQueueRowStatusProps) => (
  <span style={uploadQueueRowStatusStyle}>
    <StatusContent {...props} />
  </span>
);
