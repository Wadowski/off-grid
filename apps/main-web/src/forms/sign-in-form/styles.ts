// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const formStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  minWidth: 0,
};

export const submitBlockStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[2],
  paddingTop: tokens.space[1],
};

export const statusStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
};
