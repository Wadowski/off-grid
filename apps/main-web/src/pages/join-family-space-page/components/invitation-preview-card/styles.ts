// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const invitationPreviewStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[4],
  textAlign: "left",
};

export const invitationSummaryStyle: CSSProperties = {
  display: "flex",
  gap: tokens.space[8],
  alignItems: "center",
  padding: tokens.space[4],
};

export const invitationNameStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
};

export const invitationInviterStyle: CSSProperties = {
  padding: `0 ${tokens.space[4]} ${tokens.space[4]}`,
};

export const invitationIconTileBackground = cssVar("color-accent-soft");
export const invitationIconColor = cssVar("color-accent");
