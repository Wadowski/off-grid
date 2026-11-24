// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { pdfPreviewerStyle, pdfUnavailableStyle } from "./styles.js";
import type { PreviewerProps } from "../../types.js";

const isKnownToLackPdfViewer = (): boolean => navigator.pdfViewerEnabled === false;

export const PdfPreviewer = ({ objectUrl, name, download }: PreviewerProps) => {
  const { t } = useTranslation();

  if (isKnownToLackPdfViewer()) {
    return (
      <div style={pdfUnavailableStyle} data-testid="file-preview-pdf-unavailable">
        <Text variant="body" textId="files.preview.pdfUnavailable" />
        <Button
          type="button"
          variant="secondary"
          onClick={() => void download()}
          data-testid="file-preview-pdf-unavailable-download"
        >
          <Text variant="action" textId="files.details.actions.download" />
        </Button>
      </div>
    );
  }

  return (
    <iframe
      src={objectUrl}
      title={t("files.preview.pdfTitle", { name })}
      style={pdfPreviewerStyle}
      data-testid="file-preview-pdf"
    />
  );
};
