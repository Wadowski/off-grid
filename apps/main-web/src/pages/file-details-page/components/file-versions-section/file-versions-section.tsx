// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useId, useState } from "react";
import type { FileVersionRow } from "../../../../files/types.js";
import { DeleteVersionConfirm } from "./components/delete-version-confirm/delete-version-confirm.js";
import { VersionRow } from "./components/version-row/version-row.js";
import { VersionUploadButton } from "./components/version-upload-button/version-upload-button.js";
import { VersionsStatus } from "./components/versions-status/versions-status.js";
import { toVersionAnnouncementTextId } from "./to-version-announcement-text-id.js";
import {
  versionsAnnouncementStyle,
  versionsHeaderStyle,
  versionsHeadingStyle,
  versionsListStyle,
  versionsSectionStyle,
  versionsTitleStyle,
} from "./styles.js";
import type { FileVersionsSectionProps } from "./types.js";

export const FileVersionsSection = ({
  fileName,
  rows,
  status,
  pendingVersionId,
  errorTextId,
  completed,
  onUploadPicked,
  onRetry,
  onRestore,
  onDownload,
  onDelete,
}: FileVersionsSectionProps) => {
  const headingId = useId();
  const [rowPendingDelete, setRowPendingDelete] = useState<FileVersionRow | null>(null);
  const announcementTextId = toVersionAnnouncementTextId(completed);

  return (
    <section
      style={versionsSectionStyle}
      aria-labelledby={headingId}
      data-testid="file-versions-section"
    >
      <div style={versionsHeaderStyle}>
        <div style={versionsTitleStyle}>
          <Text variant="label" id={headingId} textId="files.versions.heading" style={versionsHeadingStyle} />
          {status === "ready" ? (
            <Text variant="caption" textId="files.versions.count" values={{ count: rows.length }} data-testid="file-versions-count" />
          ) : null}
        </div>
        <VersionUploadButton fileName={fileName} onFilePicked={onUploadPicked} />
      </div>
      <VersionsStatus status={status} errorTextId={errorTextId} onRetry={onRetry} />
      {status === "ready" ? (
        <ul style={versionsListStyle} data-testid="file-versions-list">
          {rows.map((row) => (
            <VersionRow
              key={row.id}
              row={row}
              pending={pendingVersionId === row.id}
              onRestore={() => onRestore(row)}
              onDownload={() => onDownload(row)}
              onRequestDelete={() => setRowPendingDelete(row)}
            />
          ))}
        </ul>
      ) : null}
      {rowPendingDelete === null ? null : (
        <DeleteVersionConfirm
          versionNumber={rowPendingDelete.number}
          onCancel={() => setRowPendingDelete(null)}
          onConfirm={() => {
            onDelete(rowPendingDelete);
            setRowPendingDelete(null);
          }}
        />
      )}
      <div role="status" style={versionsAnnouncementStyle}>
        {completed === null || announcementTextId === null ? null : (
          <Text
            variant="caption"
            textId={announcementTextId}
            values={{ count: completed.versionNumber }}
          />
        )}
      </div>
    </section>
  );
};
