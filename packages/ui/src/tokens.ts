// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { colorThemes } from "./color-themes.js";

export const tokens = {
  color: colorThemes,
  space: {
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.5rem",
    6: "2rem",
  },
  font: {
    family: { base: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
    size: { sm: "0.875rem", md: "1rem", lg: "1.25rem" },
    weight: { regular: "400", semibold: "600" },
  },
  radius: { sm: "0.25rem", md: "0.5rem" },
  elevation: { 1: "0 1px 2px rgb(0 0 0 / 0.08)" },
  focusRing: { width: "3px", offset: "2px" },
} as const;
