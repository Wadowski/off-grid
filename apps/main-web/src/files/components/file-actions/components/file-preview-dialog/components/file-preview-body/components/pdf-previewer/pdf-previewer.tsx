// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useTranslation } from "react-i18next";
import { pdfPreviewerStyle } from "./styles.js";
import type { PreviewerProps } from "../../types.js";

export const PdfPreviewer = ({ objectUrl, name }: PreviewerProps) => {
  const { t } = useTranslation();

  return (
    <iframe
      src={objectUrl}
      title={t("files.preview.pdfTitle", { name })}
      style={pdfPreviewerStyle}
      data-testid="file-preview-pdf"
    />
  );
};
