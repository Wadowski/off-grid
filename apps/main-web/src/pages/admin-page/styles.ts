// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const adminRowStyle = (isFirst: boolean): CSSProperties => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[3],
  minHeight: "44px",
  padding: tokens.space[3],
  borderTop: isFirst ? "none" : `1px solid ${cssVar("color-surface-high")}`,
  minWidth: 0,
});

export const adminRowMainStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[3],
  flex: "1 1 14rem",
  minWidth: 0,
};

export const adminRowTextStyle: CSSProperties = {
  display: "grid",
  gap: "0.125rem",
  minWidth: 0,
  overflowWrap: "anywhere",
};

export const adminAvatarStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  width: "2.25rem",
  height: "2.25rem",
  borderRadius: "9999px",
  background: cssVar("color-accent-soft"),
  color: cssVar("color-accent"),
  fontWeight: 600,
  flexShrink: 0,
};

export const adminChipRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: tokens.space[1],
  marginTop: "0.25rem",
};

export const adminChipStyle: CSSProperties = {
  padding: "0.125rem 0.5rem",
  borderRadius: "9999px",
  background: cssVar("color-accent-soft"),
  color: cssVar("color-accent"),
};

export const adminChipMutedStyle: CSSProperties = {
  ...adminChipStyle,
  background: cssVar("color-surface-high"),
  color: cssVar("color-outline"),
};

export const adminActionsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: tokens.space[2],
  justifyContent: "flex-end",
};

export const adminNoticeStyle: CSSProperties = {
  padding: `0 ${tokens.space[3]} ${tokens.space[3]}`,
  minWidth: 0,
};

export const adminResetCodeStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[1],
  margin: tokens.space[3],
  padding: tokens.space[3],
  borderRadius: cssVar("radius-lg"),
  background: cssVar("color-accent-soft"),
  overflowWrap: "anywhere",
};

export const adminFieldsStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[3],
  padding: tokens.space[3],
  minWidth: 0,
};

export const adminOptionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(8rem, 1fr))",
  gap: tokens.space[2],
  padding: tokens.space[3],
  minWidth: 0,
};

export const adminFieldsetStyle: CSSProperties = {
  border: "none",
  margin: 0,
  padding: 0,
  minWidth: 0,
};
