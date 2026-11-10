// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const familyMemberListStyle: CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  background: cssVar("color-surface"),
  borderRadius: "0.75rem",
};
