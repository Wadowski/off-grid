// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CSSProperties } from "react";
import { familiesPageStyle } from "../families-page/styles.js";

export const createFamilySpacePageStyle: CSSProperties = {
  ...familiesPageStyle,
  maxWidth: "30rem",
  minWidth: 0,
};
