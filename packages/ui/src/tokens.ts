// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { colorThemes } from "./color-themes.js";

export const tokens = {
  color: colorThemes,
  space: {
    1: "0.25rem",
    2: "0.5rem",
    3: "0.875rem",
    4: "1rem",
    5: "1.25rem",
    6: "2rem",
    7: "0.625rem",
    8: "0.75rem",
    9: "2.25rem",
    10: "2.5rem",
  },
  font: {
    family: {
      base: "'Inter Variable', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
      heading: "'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', system-ui, sans-serif",
      mono: "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
    },
    size: {
      "label-sm": "11px",
      "label-md": "12px",
      "body-sm": "12px",
      "body-md": "13px",
      "body-lg": "15px",
      "headline-sm": "16px",
      "headline-md": "20px",
      "headline-lg": "24px",
      "headline-xl": "32px",
      "mono-code": "12px",
    },
    lineHeight: {
      "label-sm": "14px",
      "label-md": "16px",
      "body-sm": "18px",
      "body-md": "20px",
      "body-lg": "24px",
      "headline-sm": "24px",
      "headline-md": "28px",
      "headline-lg": "32px",
      "headline-xl": "40px",
      "mono-code": "18px",
    },
    letterSpacing: {
      "label-sm": "0.02em",
      "label-md": "0.01em",
      "body-sm": "0em",
      "body-md": "-0.005em",
      "body-lg": "-0.008em",
      "headline-sm": "-0.01em",
      "headline-md": "-0.015em",
      "headline-lg": "-0.02em",
      "headline-xl": "-0.025em",
      "mono-code": "-0.01em",
    },
    weight: { regular: "400", medium: "500", semibold: "600" },
  },
  radius: { sm: "0.25rem", md: "0.5rem", lg: "0.75rem", full: "9999px" },
  elevation: {
    1: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    2: "0 24px 64px -12px rgba(27, 27, 30, 0.12), 0 4px 16px rgba(27, 27, 30, 0.04)",
    3: "0 4px 14px rgba(0, 102, 255, 0.35)",
    focus: "0 0 0 2px rgba(0, 102, 255, 0.25)",
  },
  focusRing: { width: "3px", offset: "2px" },
} as const;
