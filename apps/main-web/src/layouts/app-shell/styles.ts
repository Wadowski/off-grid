// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const appShellStyle: CSSProperties = {
  minHeight: "100vh",
  fontFamily: tokens.font.family.base,
  background: "var(--og-color-bg)",
  color: "var(--og-color-fg)",
};

export const appShellMainStyle: CSSProperties = {
  maxWidth: "40rem",
  margin: "0 auto",
  padding: tokens.space[5],
};
