// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

const DRIVE_SWITCHER_COLUMN = "20rem";

export const filesLayoutStyle = (narrow: boolean, detailsOpen: boolean): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: narrow
    ? "minmax(0, 1fr)"
    : `minmax(0, 1fr) ${detailsOpen ? tokens.size.detailsPanel : DRIVE_SWITCHER_COLUMN}`,
  alignItems: "start",
  gap: detailsOpen ? tokens.space[5] : tokens.space[6],
  minWidth: 0,
});

export const filesLayoutContentStyle: CSSProperties = {
  minWidth: 0,
};

export const filesLayoutAsideStyle: CSSProperties = {
  position: "sticky",
  top: `calc(3.5rem + ${tokens.space[4]})`,
  alignSelf: "start",
  minWidth: 0,
};
