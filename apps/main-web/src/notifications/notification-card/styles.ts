// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "@offgrid/ui";
import type { NotificationCategory } from "@offgrid/contracts";
import type { NotificationCardDensity } from "./types.js";

export const notificationCardRootStyle = (density: NotificationCardDensity): CSSProperties => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: cssVar("space-3"),
  padding: density === "full" ? cssVar("space-5") : cssVar("space-4"),
  color: cssVar("color-fg"),
});

export const notificationCardActivatorStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: cssVar("space-3"),
  width: "100%",
  minWidth: 0,
  margin: 0,
  padding: 0,
  border: "none",
  borderRadius: cssVar("radius-md"),
  background: "none",
  color: "inherit",
  font: "inherit",
  textAlign: "start",
  cursor: "pointer",
};

export const notificationCardTextStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: cssVar("space-1"),
  flex: 1,
  minWidth: 0,
};

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

export const notificationCardTitleStyle = (isUnread: boolean): CSSProperties => ({
  fontWeight: isUnread ? cssVar("font-weight-semibold") : cssVar("font-weight-regular"),
  color: isUnread ? cssVar("color-fg") : cssVar("color-muted"),
});

export const notificationCardBodyStyle: CSSProperties = {
  color: cssVar("color-muted"),
};

export const notificationCardAccentBarStyle: CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  width: cssVar("space-1"),
  background: cssVar("color-accent"),
  borderRadius: cssVar("radius-full"),
};
