// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import type { VersionsSectionVariant } from "../../types.js";

const versionRowBaseStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  minWidth: 0,
};

export const versionRowStyles: Record<VersionsSectionVariant, CSSProperties> = {
  panel: { ...versionRowBaseStyle, padding: `${tokens.space[1]} 0` },
  screen: {
    ...versionRowBaseStyle,
    flexWrap: "nowrap",
    padding: `${tokens.space[3]} ${tokens.space[4]}`,
  },
};

export const versionRowDividedStyles: Record<VersionsSectionVariant, CSSProperties> = {
  panel: {
    ...versionRowStyles.panel,
    borderTop: `1px solid ${cssVar("color-line")}`,
  },
  screen: {
    ...versionRowStyles.screen,
    borderTop: `1px solid ${cssVar("color-surface-2")}`,
  },
};

export const versionRowInfoStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[1],
  minWidth: 0,
  flex: "1 1 180px",
};

export const versionRowTitleStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: tokens.space[2],
  minWidth: 0,
};

export const versionRowMetaStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: tokens.space[2],
  color: cssVar("color-muted"),
  minWidth: 0,
  overflowWrap: "anywhere",
};
