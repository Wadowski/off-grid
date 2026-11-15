// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import { SHELL_PHONE_CONTENT_HEIGHT } from "../../../layouts/app-shell/styles.js";
import { dividerColor } from "../../dialog-styles.js";

export const detailsPageStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minHeight: SHELL_PHONE_CONTENT_HEIGHT,
  background: cssVar("color-surface"),
};

export const detailsAppBarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  padding: `${tokens.space[3]} ${tokens.space[4]}`,
};

export const detailsPhoneBodyStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  padding: `0 ${tokens.space[4]} ${tokens.space[4]}`,
  flex: 1,
};

export const detailsPhoneActionRowStyle: CSSProperties = {
  display: "flex",
  gap: tokens.space[2],
  padding: `${tokens.space[3]} ${tokens.space[4]}`,
  borderTop: `1px solid ${dividerColor(60)}`,
};
