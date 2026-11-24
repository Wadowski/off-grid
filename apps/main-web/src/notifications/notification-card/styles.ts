// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { cssVar } from "@offgrid/ui";
import type { NotificationCardDensity } from "./types.js";

export const notificationCardRootStyle = (density: NotificationCardDensity): CSSProperties => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: cssVar("space-3"),
  padding: cssVar("space-4"),
  color: cssVar("color-fg"),
  ...(density === "full"
    ? {
        background: cssVar("color-surface"),
        borderRadius: cssVar("radius-lg"),
        boxShadow: cssVar("elevation-2"),
      }
    : {}),
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
