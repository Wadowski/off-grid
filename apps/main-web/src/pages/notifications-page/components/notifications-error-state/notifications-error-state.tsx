// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { notificationsErrorStateStyle } from "./styles.js";
import type { NotificationsErrorStateProps } from "./types.js";

export const NotificationsErrorState = ({ onRetry }: NotificationsErrorStateProps) => (
  <div style={notificationsErrorStateStyle} data-testid="notifications-error-state">
    <Text variant="subheading" textId="notifications.error.title" />
    <Button
      type="button"
      variant="secondary"
      size="small"
      onClick={onRetry}
      data-testid="notifications-retry"
    >
      <Text variant="action" textId="notifications.error.retry" />
    </Button>
  </div>
);
