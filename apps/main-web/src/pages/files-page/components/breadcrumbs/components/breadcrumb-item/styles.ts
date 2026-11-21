// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const breadcrumbItemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[1],
  minWidth: 0,
  maxWidth: "100%",
};

export const breadcrumbSeparatorStyle: CSSProperties = {
  display: "inline-flex",
  flexShrink: 0,
  color: cssVar("color-outline"),
};

export const breadcrumbLinkStyle: CSSProperties = {
  minWidth: 0,
  color: cssVar("color-primary"),
  textDecoration: "none",
};

export const breadcrumbTextStyle: CSSProperties = {
  display: "block",
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};
