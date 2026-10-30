// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const colorThemes = {
  light: {
    bg: "#f6f7f9",
    surface: "#ffffff",
    "surface-2": "#eef0f4",
    line: "#dfe3ea",
    fg: "#18181b",
    muted: "#5b6170",
    accent: "#0066ff",
    "accent-fg": "#ffffff",
    "accent-soft": "#e3eeff",
    "dark-chip": "#18181b",
    "dark-chip-fg": "#f4f4f5",
    good: "#067a52",
    warn: "#9a5b00",
    danger: "#b3261e",
  },
  dark: {
    bg: "#111215",
    surface: "#1a1c21",
    "surface-2": "#23262d",
    line: "#2e323b",
    fg: "#ececef",
    muted: "#9aa1b0",
    accent: "#4d8dff",
    "accent-fg": "#0b1220",
    "accent-soft": "#16233d",
    "dark-chip": "#f4f4f5",
    "dark-chip-fg": "#18181b",
    good: "#4edea3",
    warn: "#ffb95f",
    danger: "#f2b8b5",
  },
} as const;
