// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Outlet, useOutletContext } from "react-router-dom";
import { FamilySpaceList } from "../../lists/family-space-list/family-space-list.js";
import { SettingsSubpage } from "../../layouts/settings-subpage/settings-subpage.js";
import type { FamiliesContext } from "../../types.js";

export const SettingsFamiliesPage = () => {
  const familiesContext = useOutletContext<FamiliesContext>();

  return (
    <SettingsSubpage titleTextId="families.managerHeading">
      <FamilySpaceList />
      <Outlet context={familiesContext} />
    </SettingsSubpage>
  );
};
