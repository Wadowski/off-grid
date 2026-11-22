// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, IconTile, MaterialIcon, Text } from "@offgrid/ui";
import { notificationsEmptyStateStyles } from "./styles.js";
import type { NotificationsEmptyStateProps } from "./types.js";

export const NotificationsEmptyState = ({ layout = "page" }: NotificationsEmptyStateProps) => (
  <div style={notificationsEmptyStateStyles[layout]} data-testid="notifications-empty-state">
    {layout === "page" ? (
      <IconTile
        size={cssVar("space-9")}
        background={cssVar("color-accent-soft")}
        color={cssVar("color-primary")}
      >
        <MaterialIcon name="notifications_none" size="1.125rem" color={cssVar("color-primary")} />
      </IconTile>
    ) : null}
    <Text variant="subheading" textId="notifications.empty.title" />
    <Text variant="body" textId="notifications.empty.body" />
  </div>
);
