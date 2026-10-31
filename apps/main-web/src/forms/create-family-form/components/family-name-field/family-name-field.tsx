// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text, TextField } from "@offgrid/ui";
import type { FamilyNameFieldProps } from "./types.js";

export const FamilyNameField = ({ value, errorTextId, onChange }: FamilyNameFieldProps) => (
  <TextField
    data-testid="create-family-name"
    name="name"
    value={value}
    maxLength={200}
    onChange={(event) => onChange(event.target.value)}
    label={<Text variant="label" textId="families.nameLabel" />}
    error={errorTextId === undefined ? undefined : <Text variant="error" textId={errorTextId} />}
  />
);
