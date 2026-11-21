// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const breadcrumbsStyle: CSSProperties = {
  minWidth: 0,
  maxWidth: "100%",
};

export const breadcrumbListStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: tokens.space[1],
  margin: 0,
  padding: 0,
  listStyle: "none",
  minWidth: 0,
};
