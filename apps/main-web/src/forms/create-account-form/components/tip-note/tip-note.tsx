// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import { tipNoteStyle } from "./styles.js";

export const TipNote = () => (
  <div style={tipNoteStyle}>
    <MaterialIcon name="lightbulb" size="16px" color="var(--og-color-primary)" />
    <Text variant="status" textId="createAccount.tip" />
  </div>
);
