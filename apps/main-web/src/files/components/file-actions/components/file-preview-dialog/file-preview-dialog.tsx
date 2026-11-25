// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Dialog, fileKindFromMimeType, Text } from "@offgrid/ui";
import { useEffect, useId, useRef } from "react";
import { FilePreviewBody } from "./components/file-preview-body/file-preview-body.js";
import { FilePreviewHeader } from "./components/file-preview-header/file-preview-header.js";
import {
  filePreviewDialogContentStyle,
  filePreviewDialogStyle,
  filePreviewDownloadErrorStyle,
} from "./styles.js";
import type { FilePreviewDialogProps } from "./types.js";

export const FilePreviewDialog = ({ file, download, onClose }: FilePreviewDialogProps) => {
  const nameId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <Dialog
      dialogRef={dialogRef}
      labelledBy={nameId}
      onClose={onClose}
      backdrop="glossy"
      dismissOnBackdropClick
      style={filePreviewDialogStyle}
      testId="file-preview-dialog"
    >
      <div
        style={filePreviewDialogContentStyle}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
          }
        }}
      >
        <FilePreviewHeader
          nameId={nameId}
          name={file.name}
          kind={fileKindFromMimeType(file.mimeType, false)}
          isDownloading={download.status === "downloading"}
          closeRef={closeRef}
          onDownload={() => void download.download()}
          onClose={() => dialogRef.current?.close()}
        />
        {download.status === "failed" && download.errorTextId !== null ? (
          <Text
            variant="error"
            role="alert"
            textId={download.errorTextId}
            style={filePreviewDownloadErrorStyle}
            data-testid="file-preview-download-error"
          />
        ) : null}
        <FilePreviewBody file={file} download={download.download} />
      </div>
    </Dialog>
  );
};
