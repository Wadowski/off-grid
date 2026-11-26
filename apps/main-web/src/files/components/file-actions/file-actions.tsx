// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, cssVar, MaterialIcon, Text, VisuallyHidden } from "@offgrid/ui";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toPreviewKind } from "../../to-preview-kind.js";
import { MoveDialog } from "../move-dialog/move-dialog.js";
import { useFileDownload } from "../../use-file-download.js";
import { FilePreviewDialog } from "./components/file-preview-dialog/file-preview-dialog.js";
import { fileActionsErrorStyle, fileActionsRowStyle, fileActionsStyle } from "./styles.js";
import type { FileActionsProps } from "./types.js";

export const FileActions = ({ file, move }: FileActionsProps) => {
  const { t } = useTranslation();
  const download = useFileDownload(file);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const moveButtonRef = useRef<HTMLButtonElement>(null);
  const isDownloading = download.status === "downloading";

  return (
    <div style={fileActionsStyle} data-testid="file-actions">
      <div role="group" aria-label={t("files.details.actions.label")} style={fileActionsRowStyle}>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label={t("files.details.actions.download")}
          aria-busy={isDownloading}
          disabled={isDownloading}
          onClick={() => void download.download()}
          data-testid="file-details-download"
        >
          <MaterialIcon name="download" size="20px" color={cssVar("color-fg")} />
        </Button>
        {move === undefined ? null : (
          <Button
            ref={moveButtonRef}
            type="button"
            variant="secondary"
            size="icon"
            aria-label={t("files.details.actions.move")}
            aria-haspopup="dialog"
            onClick={() => setIsMoveOpen(true)}
            data-testid="file-details-move"
          >
            <MaterialIcon name="drive_file_move" size="20px" color={cssVar("color-fg")} />
          </Button>
        )}
        {toPreviewKind(file.mimeType) === null ? null : (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label={t("files.details.actions.preview")}
            aria-haspopup="dialog"
            onClick={() => setIsPreviewOpen(true)}
            data-testid="file-details-preview"
          >
            <MaterialIcon name="visibility" size="20px" color={cssVar("color-fg")} />
          </Button>
        )}
      </div>
      <VisuallyHidden>
        <span role="status">
          {isDownloading ? (
            <Text
              variant="status"
              textId="files.details.actions.downloading"
              values={{ name: file.name }}
            />
          ) : null}
        </span>
      </VisuallyHidden>
      {download.status === "failed" && download.errorTextId !== null ? (
        <Text
          variant="error"
          role="alert"
          textId={download.errorTextId}
          style={fileActionsErrorStyle}
          data-testid="file-details-download-error"
        />
      ) : null}
      {move !== undefined && isMoveOpen ? (
        <MoveDialog
          drives={move.drives}
          source={{
            entryId: file.id,
            entryName: file.name,
            driveId: file.driveId,
            parentId: file.parentId,
          }}
          narrow={false}
          returnFocusTo={moveButtonRef.current}
          onClose={() => setIsMoveOpen(false)}
          onMoved={move.onMoved}
        />
      ) : null}
      {isPreviewOpen ? (
        <FilePreviewDialog
          file={file}
          download={download}
          onClose={() => setIsPreviewOpen(false)}
        />
      ) : null}
    </div>
  );
};
