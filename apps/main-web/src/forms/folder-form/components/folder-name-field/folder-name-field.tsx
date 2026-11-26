// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text, TextField } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import type { FolderNameFieldProps } from "../../types.js";

export const FolderNameField = ({
  copy,
  value,
  errorTextId,
  selectionEnd,
  onChange,
}: FolderNameFieldProps) => {
  const { t } = useTranslation();

  return (
    <TextField
      data-testid={`${copy.testIdPrefix}-name`}
      name="name"
      value={value}
      placeholder={copy.placeholderTextId === null ? undefined : t(copy.placeholderTextId)}
      autoFocus
      onFocus={(event) => {
        if (selectionEnd !== undefined) {
          event.currentTarget.setSelectionRange(0, selectionEnd);
        }
      }}
      onChange={(event) => onChange(event.target.value)}
      label={<Text variant="label" textId={copy.nameLabelTextId} />}
      labelAside={<Text variant="status" textId={copy.requiredTextId} />}
      error={
        errorTextId === undefined ? undefined : (
          <Text variant="error" role="alert" textId={errorTextId} />
        )
      }
    />
  );
};
