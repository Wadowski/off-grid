// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MaterialIcon, Text, cssVar } from "@offgrid/ui";
import { uploadQueueRowStatusStyle } from "./styles.js";
import type { UploadQueueRowStatusProps } from "./types.js";

export const UploadQueueRowStatus = ({ item, alertOnFailure }: UploadQueueRowStatusProps) => {
  if (item.status === "done") {
    return (
      <span style={uploadQueueRowStatusStyle}>
        <MaterialIcon name="check_circle" size="1rem" color={cssVar("color-good")} filled />
        <Text variant="caption" textId="files.upload.done" element="span" />
      </span>
    );
  }
  if (item.status === "failed") {
    return (
      <span style={uploadQueueRowStatusStyle}>
        <MaterialIcon name="error" size="1rem" color={cssVar("color-danger")} filled />
        <Text
          variant="error"
          textId={item.errorTextId ?? "files.errors.failed"}
          element="span"
          role={alertOnFailure ? "alert" : undefined}
        />
      </span>
    );
  }
  if (item.status === "uploading") {
    return (
      <span style={uploadQueueRowStatusStyle}>
        <Text
          variant="caption"
          textId="files.upload.percent"
          values={{ percent: item.percent }}
          element="span"
        />
      </span>
    );
  }
  return (
    <span style={uploadQueueRowStatusStyle}>
      <Text variant="caption" textId="files.upload.waiting" element="span" />
    </span>
  );
};
