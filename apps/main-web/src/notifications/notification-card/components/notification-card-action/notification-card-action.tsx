// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { notificationCardActionRowStyle } from "./styles.js";
import type { NotificationCardActionProps } from "./types.js";

export const NotificationCardAction = ({ actionId, onActivate }: NotificationCardActionProps) => (
  <div style={notificationCardActionRowStyle}>
    <Button
      variant="secondary"
      size="small"
      onClick={onActivate}
      data-testid="notification-card-action"
    >
      <Text variant="label" textId={actionId} />
    </Button>
  </div>
);
