// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import type { VersionsSectionVariant } from "./types.js";

const versionsHeaderBaseStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  minWidth: 0,
};

export const versionsSectionStyles: Record<VersionsSectionVariant, CSSProperties> = {
  panel: {
    display: "grid",
    gap: tokens.space[2],
    padding: tokens.space[2],
    borderRadius: cssVar("radius-md"),
    border: `1px solid ${cssVar("color-line")}`,
    background: cssVar("color-surface-low"),
    minWidth: 0,
  },
  screen: {
    display: "grid",
    gap: tokens.space[2],
    minWidth: 0,
  },
};

export const versionsHeaderStyles: Record<VersionsSectionVariant, CSSProperties> = {
  panel: versionsHeaderBaseStyle,
  screen: { ...versionsHeaderBaseStyle, paddingInline: tokens.space[2] },
};

export const versionsTitleStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  minWidth: 0,
};

export const versionsHeadingStyle: CSSProperties = {
  color: cssVar("color-muted"),
  fontWeight: cssVar("font-weight-semibold"),
  letterSpacing: cssVar("letter-spacing-label-sm"),
  textTransform: "uppercase",
};

export const versionsListStyles: Record<VersionsSectionVariant, CSSProperties> = {
  panel: {
    display: "grid",
    margin: 0,
    padding: 0,
    listStyle: "none",
    minWidth: 0,
  },
  screen: {
    display: "grid",
    margin: 0,
    padding: 0,
    listStyle: "none",
    minWidth: 0,
    overflow: "hidden",
    background: cssVar("color-surface"),
    borderRadius: cssVar("radius-lg"),
    boxShadow: cssVar("elevation-1"),
  },
};

export const versionsAnnouncementStyle: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};
