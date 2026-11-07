// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text, TextField } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { FAMILY_NAME_INPUT_MAX_LENGTH } from "../../../../constants.js";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import type { FamilyNameFieldProps } from "./types.js";

export const FamilyNameField = ({ value, errorTextId, onChange }: FamilyNameFieldProps) => {
  const { t } = useTranslation();

  return (
    <TextField
      data-testid="create-family-name"
      name="name"
      value={value}
      placeholder={t("families.namePlaceholder")}
      maxLength={FAMILY_NAME_INPUT_MAX_LENGTH}
      onChange={(event) => onChange(event.target.value)}
      label={<Text variant="label" textId="families.nameLabel" />}
      labelAside={<Text variant="status" textId="families.required" />}
      leading={<MaterialIcon name="cottage" size="18px" color="var(--og-color-outline)" />}
      error={errorTextId === undefined ? undefined : <Text variant="error" textId={errorTextId} />}
    />
  );
};
