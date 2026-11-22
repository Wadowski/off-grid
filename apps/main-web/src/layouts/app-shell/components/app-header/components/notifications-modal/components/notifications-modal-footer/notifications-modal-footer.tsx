// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, MaterialIcon, Text } from "@offgrid/ui";
import { notificationsModalFooterStyle } from "./styles.js";
import type { NotificationsModalFooterProps } from "./types.js";

export const NotificationsModalFooter = ({ onViewAll }: NotificationsModalFooterProps) => (
  <div style={notificationsModalFooterStyle}>
    <Button type="button" variant="primary" fullWidth onClick={onViewAll} data-testid="notifications-modal-view-all">
      <Text variant="action" textId="notifications.modal.viewAll" />
      <MaterialIcon name="arrow_forward" size="18px" color="currentColor" />
    </Button>
  </div>
);
