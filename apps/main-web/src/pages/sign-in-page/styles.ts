// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import { promptStyle } from "../../forms/shared/styles.js";

export const signInPagePromptStyle: CSSProperties = {
  ...promptStyle,
  paddingTop: tokens.space[2],
};
