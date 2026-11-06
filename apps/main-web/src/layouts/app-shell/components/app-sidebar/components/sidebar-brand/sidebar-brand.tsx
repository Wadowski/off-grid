// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import markUrl from "../../../../../../media/offgrid-mark-192.png";

export const SidebarBrand = () => (
  <div className="og-sidebar-brand">
    <img className="og-sidebar-brand-mark" src={markUrl} alt="" aria-hidden="true" />
    <Text variant="brand" textId="appName" />
  </div>
);
