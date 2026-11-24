// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FilePickerButton, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import type { VersionUploadButtonProps } from "./types.js";

export const VersionUploadButton = ({ fileName, onFilePicked }: VersionUploadButtonProps) => {
  const { t } = useTranslation();

  return (
    <FilePickerButton
      variant="secondary"
      size="small"
      ariaLabel={t("files.versions.uploadFor", { name: fileName })}
      onFilesPicked={(files) => {
        const [first] = files;
        if (first !== undefined) {
          onFilePicked(first);
        }
      }}
      testId="file-versions-upload"
    >
      <Text variant="action" textId="files.versions.upload" />
    </FilePickerButton>
  );
};
