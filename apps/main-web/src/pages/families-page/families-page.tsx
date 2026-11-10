// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { FamilySpaceList } from "../../lists/family-space-list/family-space-list.js";
import { familiesPageStyle } from "./styles.js";

export const FamiliesPage = () => (
  <div style={familiesPageStyle}>
    <Text variant="heading" textId="settings.familyLabel" />
    <FamilySpaceList />
  </div>
);
