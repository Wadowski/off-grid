// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MaterialIcon, Text } from "@offgrid/ui";
import { languageLabelStyle } from "./styles.js";

export const LanguageLabel = () => (
  <span style={languageLabelStyle}>
    <MaterialIcon name="language" size="16px" color="currentColor" />
    <Text variant="caption" textId="authLayout.language" />
  </span>
);
