// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text, TextField } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import type { FolderNameFieldProps } from "../../types.js";

export const FolderNameField = ({ value, errorTextId, onChange }: FolderNameFieldProps) => {
  const { t } = useTranslation();

  return (
    <TextField
      data-testid="new-folder-name"
      name="name"
      value={value}
      placeholder={t("files.newFolder.placeholder")}
      autoFocus
      onChange={(event) => onChange(event.target.value)}
      label={<Text variant="label" textId="files.newFolder.name" />}
      labelAside={<Text variant="status" textId="files.newFolder.required" />}
      error={errorTextId === undefined ? undefined : <Text variant="error" textId={errorTextId} />}
    />
  );
};
