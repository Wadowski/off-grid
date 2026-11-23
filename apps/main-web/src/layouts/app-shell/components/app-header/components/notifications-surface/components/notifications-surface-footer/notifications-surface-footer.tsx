// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, MaterialIcon, Text } from "@offgrid/ui";
import { notificationsSurfaceFooterStyle } from "../../styles.js";
import type { NotificationsSurfaceFooterProps } from "./types.js";

export const NotificationsSurfaceFooter = ({
  onViewAll,
  variant,
  testId,
  textId,
  style,
}: NotificationsSurfaceFooterProps) => (
  <div style={{ ...notificationsSurfaceFooterStyle, ...style }}>
    <Button type="button" variant={variant} fullWidth onClick={onViewAll} data-testid={testId}>
      <Text variant="action" textId={textId} />
      <MaterialIcon name="arrow_forward" size="18px" color="currentColor" />
    </Button>
  </div>
);
