// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";
import type { TrailingInset } from "./types.js";

const cssColor = (name: string): string => `var(--og-color-${name})`;

export const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
  minWidth: 0,
};

export const labelRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
};

export const labelStyle: CSSProperties = {
  color: cssColor("fg"),
};

export const shellStyle = (narrow: boolean): CSSProperties =>
  narrow
    ? {
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: tokens.space[7],
        padding: `${tokens.space[8]} ${tokens.space[3]}`,
        borderRadius: tokens.radius.lg,
        background: cssColor("surface-2"),
        boxShadow: tokens.elevation[1],
      }
    : {
        position: "relative",
      };

export const iconSlotStyle = (narrow: boolean): CSSProperties =>
  narrow
    ? {
        display: "flex",
        alignItems: "center",
      }
    : {
        position: "absolute",
        left: tokens.space[8],
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        alignItems: "center",
        pointerEvents: "none",
      };

export const trailingSlotStyle = (narrow: boolean, inset: TrailingInset): CSSProperties =>
  narrow
    ? {
        display: "flex",
        alignItems: "center",
      }
    : {
        position: "absolute",
        right: inset === "action" ? tokens.space[2] : tokens.space[8],
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        alignItems: "center",
      };

export const inputStyle = (
  narrow: boolean,
  mono: boolean,
  hasTrailing: boolean,
  invalid: boolean,
): CSSProperties => {
  const family = mono ? tokens.font.family.mono : tokens.font.family.base;
  const invalidRing = invalid ? { boxShadow: `0 0 0 1px ${cssColor("danger")}` } : {};
  const letterSpacing = mono ? "0.025em" : tokens.font.letterSpacing["body-md"];

  if (narrow) {
    return {
      flex: 1,
      minWidth: 0,
      padding: 0,
      border: "none",
      background: "transparent",
      color: cssColor("fg"),
      outline: "none",
      fontFamily: family,
      fontSize: tokens.font.size["body-lg"],
      lineHeight: tokens.font.lineHeight["body-lg"],
      letterSpacing,
      ...invalidRing,
    };
  }

  return {
    width: "100%",
    minWidth: 0,
    padding: `${tokens.space[2]} ${hasTrailing ? tokens.space[10] : tokens.space[8]} ${tokens.space[2]} ${tokens.space[9]}`,
    border: "none",
    borderRadius: tokens.radius.md,
    background: cssColor("surface-low"),
    color: cssColor("fg"),
    outline: "none",
    fontFamily: family,
    fontSize: tokens.font.size["body-md"],
    lineHeight: tokens.font.lineHeight["body-md"],
    letterSpacing,
    ...invalidRing,
  };
};

export const errorStyle: CSSProperties = {
  margin: 0,
};
