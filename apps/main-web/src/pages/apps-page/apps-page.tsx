// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { AppsListRow } from "./components/apps-list-row/apps-list-row.js";
import { APPS_LIST_ITEMS } from "./constants.js";
import { appsListStyle, appsPageStyle } from "./styles.js";

export const AppsPage = () => (
  <div style={appsPageStyle}>
    <Text variant="heading" textId="apps.heading" />
    <div style={appsListStyle} data-testid="apps-list">
      {APPS_LIST_ITEMS.map((item) => (
        <AppsListRow key={item.id} item={item} />
      ))}
    </div>
  </div>
);
