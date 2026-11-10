// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const createFamilySpaceFormStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[5],
};

export const pickerSectionStyle: CSSProperties = {
  display: "grid",
  gap: tokens.space[2],
  textAlign: "left",
};
