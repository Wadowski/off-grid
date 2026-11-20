// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "@offgrid/ui";
import type { NotificationCategory } from "@offgrid/contracts";

export const notificationCardHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: cssVar("space-2"),
};

export const notificationCardMetaStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: cssVar("space-2"),
  flexShrink: 0,
};

const notificationCardCategoryStyles: Record<NotificationCategory, CSSProperties> = {
  calendar: { color: cssVar("color-primary"), background: cssVar("color-accent-soft") },
  "account-security": { color: cssVar("color-good"), background: cssVar("color-surface-high") },
};

const notificationCardCategoryBaseStyle: CSSProperties = {
  padding: `${cssVar("space-1")} ${cssVar("space-2")}`,
  borderRadius: cssVar("radius-sm"),
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

export const notificationCardCategoryStyle = (category: NotificationCategory): CSSProperties => ({
  ...notificationCardCategoryBaseStyle,
  ...notificationCardCategoryStyles[category],
});

export const notificationCardTimeStyle: CSSProperties = {
  color: cssVar("color-muted"),
};

export const notificationCardUnreadDotStyle: CSSProperties = {
  width: cssVar("space-2"),
  height: cssVar("space-2"),
  borderRadius: cssVar("radius-full"),
  background: cssVar("color-accent"),
  flexShrink: 0,
};
