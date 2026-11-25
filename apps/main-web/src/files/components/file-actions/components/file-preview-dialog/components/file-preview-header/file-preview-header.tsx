// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, cssVar, FileTypeIcon, MaterialIcon, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import {
  filePreviewControlsStyle,
  filePreviewHeaderStyle,
  filePreviewNameStyle,
  filePreviewTitleStyle,
} from "./styles.js";
import type { FilePreviewHeaderProps } from "./types.js";

export const FilePreviewHeader = ({
  nameId,
  name,
  kind,
  isDownloading,
  closeRef,
  onDownload,
  onClose,
}: FilePreviewHeaderProps) => {
  const { t } = useTranslation();

  return (
    <header style={filePreviewHeaderStyle}>
      <div style={filePreviewTitleStyle}>
        <FileTypeIcon kind={kind} />
        <Text
          variant="subheading"
          id={nameId}
          value={name}
          style={filePreviewNameStyle}
          data-testid="file-preview-name"
        />
      </div>
      <div style={filePreviewControlsStyle}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("files.details.actions.download")}
          aria-busy={isDownloading}
          disabled={isDownloading}
          onClick={onDownload}
          data-testid="file-preview-download"
        >
          <MaterialIcon name="download" size="20px" color={cssVar("color-muted")} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          ref={closeRef}
          aria-label={t("files.preview.close")}
          onClick={onClose}
          data-testid="file-preview-close"
        >
          <MaterialIcon name="close" size="20px" color={cssVar("color-muted")} />
        </Button>
      </div>
    </header>
  );
};
