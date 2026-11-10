// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FamilySpaceList } from "../../lists/family-space-list/family-space-list.js";
import { SettingsSubpage } from "../../layouts/settings-subpage/settings-subpage.js";

export const SettingsFamiliesPage = () => (
  <SettingsSubpage titleTextId="families.managerHeading" centered>
    <FamilySpaceList />
  </SettingsSubpage>
);
