// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

const cssColor = (name: string): string => `var(--og-color-${name})`;

export const authLayoutStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  overflow: "hidden",
  fontFamily: tokens.font.family.base,
  background: cssColor("bg"),
  color: cssColor("fg"),
};

export const backdropStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  overflow: "hidden",
};

export const blobPrimaryStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "50%",
  width: "48rem",
  height: "48rem",
  borderRadius: tokens.radius.full,
  background: cssColor("accent-soft"),
  opacity: 0.18,
  filter: "blur(130px)",
  transform: "translate(calc(-50% + 3rem), calc(-50% - 6rem))",
};

export const blobSecondaryStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "50%",
  width: "36rem",
  height: "36rem",
  borderRadius: tokens.radius.full,
  background: cssColor("secondary-fixed"),
  opacity: 0.1,
  filter: "blur(110px)",
  transform: "translate(calc(-50% - 6rem), calc(-50% + 9rem))",
};

export const glassOverlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  backdropFilter: "blur(40px)",
};

export const glassTintStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: cssColor("bg"),
  opacity: 0.4,
};

export const headerStyle = (narrow: boolean): CSSProperties =>
  narrow
    ? {
        position: "relative",
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${tokens.space[1]} ${tokens.space[4]} ${tokens.space[2]}`,
      }
    : {
        position: "relative",
        zIndex: 1,
        padding: `${tokens.space[5]} ${tokens.space[6]} 0`,
      };

export const headerRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  maxWidth: "64rem",
  margin: "0 auto",
};

export const brandMarkStyle: CSSProperties = {
  width: "1.75rem",
  height: "1.75rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: tokens.radius.md,
  background: cssColor("surface"),
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
};

export const mainStyle = (narrow: boolean): CSSProperties =>
  narrow
    ? {
        position: "relative",
        zIndex: 1,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: `0 ${tokens.space[4]} ${tokens.space[6]}`,
      }
    : {
        position: "relative",
        zIndex: 1,
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: `${tokens.space[6]} ${tokens.space[6]}`,
      };

export const cardStyle = (narrow: boolean): CSSProperties =>
  narrow
    ? {
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }
    : {
        width: "100%",
        maxWidth: "30rem",
        display: "flex",
        flexDirection: "column",
        padding: tokens.space[6],
        borderRadius: tokens.radius.lg,
        background: cssColor("surface"),
        boxShadow: tokens.elevation[2],
        overflow: "hidden",
      };

export const footerStyle = (narrow: boolean): CSSProperties =>
  narrow
    ? {
        position: "relative",
        zIndex: 1,
        padding: `0 ${tokens.space[4]} ${tokens.space[6]}`,
        textAlign: "center",
        color: cssColor("muted"),
      }
    : {
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: tokens.space[4],
        padding: `0 ${tokens.space[6]} ${tokens.space[5]}`,
        color: cssColor("muted"),
      };
