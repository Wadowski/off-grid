// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, MaterialIcon, Text } from "@offgrid/ui";
import { notificationsPopoverFooterStyle } from "./styles.js";
import type { NotificationsPopoverFooterProps } from "./types.js";

export const NotificationsPopoverFooter = ({ onViewAll }: NotificationsPopoverFooterProps) => (
  <div style={notificationsPopoverFooterStyle}>
    <Button
      type="button"
      variant="secondary"
      fullWidth
      onClick={onViewAll}
      data-testid="notifications-popover-view-all"
    >
      <Text variant="action" textId="notifications.popover.viewAll" />
      <MaterialIcon name="arrow_forward" size="18px" color="currentColor" />
    </Button>
  </div>
);
